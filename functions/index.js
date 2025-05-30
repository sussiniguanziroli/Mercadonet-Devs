// functions/index.js

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const storage = admin.storage();

exports.finalizeProviderRegistrationFiles = onDocumentCreated("proveedores/{userId}", async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn("No data (snapshot) associated with the event. This should not happen for onDocumentCreated.");
      return null;
    }

    const userId = event.params.userId;
    const providerData = snap.data();

    logger.log(
      `[${userId}] Starting finalizeProviderRegistrationFiles for new provider (v2 syntax).`
    );

    if (
      !providerData ||
      providerData.fileProcessingStatus !== "pending"
    ) {
      logger.log(
        `[${userId}] Exiting: Provider data not found, or fileProcessingStatus is not 'pending' (is '${providerData?.fileProcessingStatus}').`
      );
      return null;
    }

    const updates = {};
    let allFilesProcessedSuccessfully = true;
    const defaultBucket = storage.bucket(); 

    const processFile = async (
      fileObject, // Original file object from Firestore
      permanentFolder
    ) => {
      if (
        !fileObject ||
        !fileObject.tempStoragePath || 
        fileObject.isPermanent 
      ) {
        logger.log(`[${userId}] Skipping file processing for object (no tempPath or already permanent):`, fileObject ? (fileObject.url || "No URL") : "No file object");
        const returnObject = { ...fileObject };
        // If isPermanent is true, it should ideally already be clean of errorMoving.
        // If no tempStoragePath, it was likely never meant for upload processing here.
        if(returnObject.isPermanent) delete returnObject.errorMoving;
        return returnObject; 
      }

      const tempPath = fileObject.tempStoragePath;
      let fileName = tempPath.substring(tempPath.lastIndexOf("/") + 1);
      
      try {
        fileName = decodeURIComponent(fileName);
      } catch (e) {
        logger.warn(`[${userId}] Could not decode filename: ${fileName}`, e);
      }

      const newPermanentPath = `providers/${userId}/${permanentFolder}/${fileName}`;
      const file = defaultBucket.file(tempPath);
      const newFile = defaultBucket.file(newPermanentPath);

      try {
        logger.log(`[${userId}] Moving: ${tempPath} to ${newPermanentPath}`);
        await file.move(newPermanentPath);
        logger.log(`[${userId}] Moved: ${tempPath} to ${newPermanentPath} successfully.`);
        
        await newFile.makePublic();
        const publicUrl = newFile.publicUrl();
        
        logger.log(`[${userId}] File made public at: ${publicUrl}`);

        const processedFileData = {
          url: publicUrl,
          tempStoragePath: '', 
          permanentStoragePath: newPermanentPath,
          isPermanent: true,
        };

        if (fileObject.fileType !== undefined) {
          processedFileData.fileType = fileObject.fileType;
        }
        if (fileObject.mimeType !== undefined) {
          processedFileData.mimeType = fileObject.mimeType;
        }
        
        if (Object.prototype.hasOwnProperty.call(fileObject, 'titulo')) {
            processedFileData.titulo = fileObject.titulo;
        }
        if (Object.prototype.hasOwnProperty.call(fileObject, 'precio')) {
            processedFileData.precio = fileObject.precio;
        }

        if (Object.prototype.hasOwnProperty.call(fileObject, 'imagenURL')) {
          processedFileData.imagenURL = publicUrl;
        }
        
        return processedFileData;

      } catch (error) {
        logger.error(
          `[${userId}] Error moving file ${tempPath} to ${newPermanentPath}:`,
          error
        );
        allFilesProcessedSuccessfully = false;
        return { 
            ...fileObject, 
            errorMoving: error.message, 
            isPermanent: false 
        }; 
      }
    };

    if (providerData.logo && providerData.logo.tempStoragePath && !providerData.logo.isPermanent) {
      updates["logo"] = await processFile(providerData.logo, "logos");
    } else if (providerData.logo) { 
      const cleanLogo = { ...providerData.logo };
      if(cleanLogo.isPermanent) delete cleanLogo.errorMoving;
      updates["logo"] = cleanLogo; 
    }


    if (providerData.carrusel && Array.isArray(providerData.carrusel)) {
      const processedCarrusel = [];
      for (const item of providerData.carrusel) {
        if(item && item.tempStoragePath && !item.isPermanent) {
            processedCarrusel.push(await processFile(item, "carrusel_media"));
        } else if (item) { // Ensure item is not null/undefined
            const cleanItem = { ...item };
            if(cleanItem.isPermanent) delete cleanItem.errorMoving;
            processedCarrusel.push(cleanItem); 
        }
      }
      updates["carrusel"] = processedCarrusel;
    }

    if (providerData.galeria && Array.isArray(providerData.galeria)) {
      const processedGaleria = [];
      for (const item of providerData.galeria) {
         if(item && item.tempStoragePath && !item.isPermanent) {
            processedGaleria.push(await processFile(item, "galeria_productos"));
        } else if (item) { // Ensure item is not null/undefined
            const cleanItem = { ...item };
            if(cleanItem.isPermanent) delete cleanItem.errorMoving;
            processedGaleria.push(cleanItem);
        }
      }
      updates["galeria"] = processedGaleria;
    }

    updates["fileProcessingStatus"] = allFilesProcessedSuccessfully
      ? "completed"
      : "completed_with_errors";
    updates["updatedAt"] = admin.firestore.FieldValue.serverTimestamp();

    try {
      await snap.ref.update(updates);
      logger.log(
        `[${userId}] Firestore document updated successfully. Status: ${updates["fileProcessingStatus"]}`
      );
    } catch (error) {
      logger.error(
        `[${userId}] CRITICAL: Error updating Firestore document AFTER file processing:`,
        error,
        "Data attempted for update:",
        JSON.stringify(updates, null, 2) 
      );
    }
    return null;
  });
