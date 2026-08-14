import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';

/**
 * Sube uno o varios PDFs a `{modulo}/{docId}/{archivo}` en Storage y devuelve
 * los metadatos a guardar en el documento de Firestore ({name, url, path}).
 */
export async function uploadDocs(modulo, docId, files) {
  const uploads = Array.from(files)
    .filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    .map(async (file) => {
      const path = `${modulo}/${docId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { name: file.name, url, path };
    });

  return Promise.all(uploads);
}

export async function removeDoc(path) {
  await deleteObject(ref(storage, path));
}
