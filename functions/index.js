const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const storage = admin.storage();
const PERMANENT_STORAGE_BASE_PATH = 'proveedores_media';

exports.processProviderMediaOnWrite = onDocumentWritten("proveedores/{providerId}", async (event) => {
    const providerId = event.params.providerId;
    const snapAfter = event.data.after;

    if (!snapAfter.exists) {
        logger.log(`[${providerId}] Document deleted. No media to process.`);
        return null;
    }

    const providerData = snapAfter.data();

    if (providerData.fileProcessingStatus !== 'pending_move') {
        logger.log(`[${providerId}] Skipping. Status is '${providerData.fileProcessingStatus || 'not set'}', not 'pending_move'.`);
        return null;
    }
    
    logger.log(
      `[${providerId}] Starting media processing. Status: ${providerData.fileProcessingStatus}`
    );

    const updates = {};
    const defaultBucket = storage.bucket();

    const processAndMoveFile = async (fileObject, subFolder) => {
      if (!fileObject || !fileObject.url || !fileObject.tempPath) {
        return fileObject;
      }
      
      const tempPath = fileObject.tempPath;
      let fileName = tempPath.substring(tempPath.lastIndexOf("/") + 1);
      try { fileName = decodeURIComponent(fileName); } catch (e) { logger.warn(`[${providerId}] Could not decode filename: ${fileName}`, e); }

      const newPermanentPath = `${PERMANENT_STORAGE_BASE_PATH}/${providerId}/${subFolder}/${fileName}`;
      const tempFileRef = defaultBucket.file(tempPath);
      const newFileRef = defaultBucket.file(newPermanentPath);

      try {
        const [exists] = await tempFileRef.exists();
        if (!exists) {
            logger.warn(`[${providerId}] Source file does not exist at ${tempPath}. Skipping move.`);
            return { ...fileObject, errorProcessing: "Source file not found.", isPermanent: false };
        }

        await tempFileRef.copy(newPermanentPath);
        await tempFileRef.delete();
        await newFileRef.makePublic();
        const publicUrl = newFileRef.publicUrl();

        const newFileObject = { ...fileObject, url: publicUrl, permanentStoragePath: newPermanentPath, isPermanent: true };
        delete newFileObject.tempPath; 
        delete newFileObject.tempId;
        delete newFileObject.status;

        if (newFileObject.hasOwnProperty('imagenURL')) {
            newFileObject.imagenURL = publicUrl;
        }

        return newFileObject;
      } catch (error) {
        logger.error(`[${providerId}] Error processing file ${tempPath}:`, error);
        return { ...fileObject, errorProcessing: error.message, isPermanent: false };
      }
    };
    
    let changesMade = false;

    if (providerData.logo && providerData.logo.tempPath) {
        const processedLogo = await processAndMoveFile(providerData.logo, "logos");
        if (JSON.stringify(processedLogo) !== JSON.stringify(providerData.logo)) {
            updates["logo"] = processedLogo;
            changesMade = true;
        }
    }

    if (Array.isArray(providerData.carrusel) && providerData.carrusel.length > 0) {
      const processedPromises = providerData.carrusel.map(item => processAndMoveFile(item, "carrusel_media"));
      const processedResult = await Promise.all(processedPromises);
      if (JSON.stringify(processedResult) !== JSON.stringify(providerData.carrusel)) {
          updates["carrusel"] = processedResult;
          changesMade = true;
      }
    }

    if (Array.isArray(providerData.galeria) && providerData.galeria.length > 0) {
      const processedPromises = providerData.galeria.map(item => processAndMoveFile(item, "galeria_productos"));
      const processedResult = await Promise.all(processedPromises);
      if (JSON.stringify(processedResult) !== JSON.stringify(providerData.galeria)) {
          updates["galeria"] = processedResult;
          changesMade = true;
      }
    }

    if (changesMade) {
        updates["fileProcessingStatus"] = "completed_by_cloud_function";
        updates["updatedAt"] = admin.firestore.FieldValue.serverTimestamp();
        try {
            await snapAfter.ref.update(updates);
            logger.log(`[${providerId}] Firestore document updated successfully. Status: ${updates["fileProcessingStatus"]}`);
        } catch (error) {
            logger.error(`[${providerId}] CRITICAL: Error updating Firestore with finalized media:`, error);
        }
    } else {
        await snapAfter.ref.update({
            fileProcessingStatus: "completed_no_action_needed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    return null;
});