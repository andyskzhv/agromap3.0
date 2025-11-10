const fs = require('fs');
const path = require('path');

/**
 * Elimina un archivo físico del servidor
 * @param {string} fileUrl - URL relativa del archivo (ej: '/uploads/productos/producto-123.jpg')
 * @returns {boolean} - true si se eliminó exitosamente, false si hubo error
 */
const eliminarArchivo = (fileUrl) => {
  if (!fileUrl) return false;

  try {
    // Convertir la URL relativa a una ruta absoluta del sistema
    // Remover el primer '/' si existe
    const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const filePath = path.join(__dirname, '..', '..', relativePath);

    // Verificar si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Archivo eliminado: ${filePath}`);
      return true;
    } else {
      console.log(`Archivo no encontrado: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error al eliminar archivo ${fileUrl}:`, error.message);
    return false;
  }
};

/**
 * Elimina múltiples archivos del servidor
 * @param {string[]} fileUrls - Array de URLs relativas de archivos
 * @returns {object} - Objeto con estadísticas de eliminación {eliminados, errores}
 */
const eliminarArchivos = (fileUrls) => {
  if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
    return { eliminados: 0, errores: 0 };
  }

  let eliminados = 0;
  let errores = 0;

  fileUrls.forEach(fileUrl => {
    if (eliminarArchivo(fileUrl)) {
      eliminados++;
    } else {
      errores++;
    }
  });

  return { eliminados, errores };
};

/**
 * Elimina archivos que ya no están en la nueva lista (útil para actualizaciones)
 * @param {string[]} archivosAntiguos - Array de URLs de archivos anteriores
 * @param {string[]} archivosNuevos - Array de URLs de archivos nuevos
 * @returns {object} - Objeto con estadísticas de eliminación
 */
const eliminarArchivosNoUsados = (archivosAntiguos, archivosNuevos) => {
  if (!Array.isArray(archivosAntiguos) || archivosAntiguos.length === 0) {
    return { eliminados: 0, errores: 0 };
  }

  const archivosAEliminar = archivosAntiguos.filter(
    archivoAntiguo => !archivosNuevos.includes(archivoAntiguo)
  );

  return eliminarArchivos(archivosAEliminar);
};

module.exports = {
  eliminarArchivo,
  eliminarArchivos,
  eliminarArchivosNoUsados
};
