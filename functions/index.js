const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");

admin.initializeApp();
const storage = getStorage();
const db = admin.firestore();

const PERMANENT_STORAGE_BASE_PATH = 'proveedores_media';

const processFileMove = async (fileObject, providerId, subFolder, bucket) => {
    if (!fileObject || !fileObject.url || !fileObject.tempPath) return fileObject;

    const { tempPath } = fileObject;
    const fileName = tempPath.substring(tempPath.lastIndexOf("/") + 1);
    const newPermanentPath = `${PERMANENT_STORAGE_BASE_PATH}/${providerId}/${subFolder}/${fileName}`;
    
    const tempFileRef = bucket.file(tempPath);
    const newFileRef = bucket.file(newPermanentPath);

    try {
        const [exists] = await tempFileRef.exists();
        if (!exists) {
            logger.warn(`[${providerId}] Source file does not exist at ${tempPath}.`, { structuredData: true });
            return { ...fileObject, errorProcessing: "Source file not found." };
        }

        await tempFileRef.copy(newFileRef);
        await tempFileRef.delete();
        await newFileRef.makePublic();
        const publicUrl = newFileRef.publicUrl();

        const newFileObject = { ...fileObject, url: publicUrl, permanentStoragePath: newPermanentPath, isPermanent: true };
        delete newFileObject.tempPath;
        if(newFileObject.hasOwnProperty('imagenURL')) newFileObject.imagenURL = publicUrl;
        
        return newFileObject;

    } catch (error) {
        logger.error(`[${providerId}] Error processing file ${tempPath}:`, error, { structuredData: true });
        return { ...fileObject, errorProcessing: error.message };
    }
};

const deleteUnusedFiles = async (oldMedia, newMedia, bucket) => {
    const oldPaths = new Set((Array.isArray(oldMedia) ? oldMedia : (oldMedia ? [oldMedia] : [])).map(m => m.permanentStoragePath).filter(Boolean));
    const newPaths = new Set((Array.isArray(newMedia) ? newMedia : (newMedia ? [newMedia] : [])).map(m => m.permanentStoragePath).filter(Boolean));
    const pathsToDelete = [...oldPaths].filter(p => !newPaths.has(p));
    
    const deletePromises = pathsToDelete.map(path => bucket.file(path).delete().catch(e => logger.warn(`Failed to delete old file: ${path}`, e)));
    await Promise.all(deletePromises);
};


exports.processProviderMediaOnWrite = onDocumentWritten("proveedores/{providerId}", async (event) => {
    const providerId = event.params.providerId;
    const snapAfter = event.data.after;
    const snapBefore = event.data.before;

    if (!snapAfter.exists) {
        logger.log(`[${providerId}] Document deleted. No action needed.`);
        return null;
    }

    const providerData = snapAfter.data();
    const oldProviderData = snapBefore.exists ? snapBefore.data() : {};
    const status = providerData.fileProcessingStatus;

    if (status !== 'pending_move' && status !== 'pending_update_move') {
        logger.log(`[${providerId}] Skipping. Status is '${status || 'not set'}'`);
        return null;
    }

    logger.log(`[${providerId}] Starting media processing for status: ${status}`);

    const bucket = storage.bucket();
    const updates = {};
    let changesMade = false;
    
    const mediaFields = ['logo', 'carrusel', 'galeria'];
    const subFolders = { logo: 'logos', carrusel: 'carrusel_media', galeria: 'galeria_productos' };
    
    for (const field of mediaFields) {
        const newMedia = providerData[field];
        const oldMedia = oldProviderData[field];

        if (Array.isArray(newMedia)) {
            const processedItems = await Promise.all(newMedia.map(item => processFileMove(item, providerId, subFolders[field], bucket)));
            if (JSON.stringify(processedItems) !== JSON.stringify(newMedia)) {
                updates[field] = processedItems;
                changesMade = true;
            }
        } else if (newMedia) { // Handle single object fields like logo
            const processedItem = await processFileMove(newMedia, providerId, subFolders[field], bucket);
            if (JSON.stringify(processedItem) !== JSON.stringify(newMedia)) {
                updates[field] = processedItem;
                changesMade = true;
            }
        }

        // Handle deletions for updates
        if (status === 'pending_update_move') {
           await deleteUnusedFiles(oldMedia, updates[field] || newMedia, bucket);
        }
    }

    if (changesMade) {
        updates["fileProcessingStatus"] = `completed_${status === 'pending_move' ? 'creation' : 'update'}`;
        updates["updatedAt"] = admin.firestore.FieldValue.serverTimestamp();
        await snapAfter.ref.update(updates);
        logger.log(`[${providerId}] Firestore updated successfully. Status: ${updates.fileProcessingStatus}`);
    } else {
        await snapAfter.ref.update({
            fileProcessingStatus: "completed_no_action_needed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.log(`[${providerId}] No media changes requiring processing.`);
    }

    return null;
});
