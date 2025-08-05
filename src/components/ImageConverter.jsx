import { useState } from "react";

const ImageConverter = () => {
  const [images, setImages] = useState([]); // { file, previewUrl }
  const [width, setWidth] = useState(800);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newImages = selectedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[indexToRemove].previewUrl);
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };

  const handleClearAll = () => {
    images.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setImages([]);
  };

  const handleConvert = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();

      for (const { file } of images) {
        const img = await loadImage(file);
        const canvas = document.createElement("canvas");
        const scale = width / img.width;
        canvas.width = width;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/webp", 0.8)
        );

        if (blob) {
          const newFileName = file.name.replace(/\.(jpg|jpeg|png)$/i, ".webp");
          const fileHandle = await dirHandle.getFileHandle(newFileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        }
      }

      setSuccessMessage("Imágenes convertidas y guardadas correctamente ✅");

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error al guardar archivos:", error);
      alert("Ocurrió un error al intentar guardar las imágenes.");
    }
  };

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <div>
      {successMessage && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "4px",
            border: "1px solid #c3e6cb",
          }}
        >
          {successMessage}
        </div>
      )}
      {/* Botón personalizado para subir archivos */}
      <label
        htmlFor="file-upload"
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          backgroundColor: "#ffffffff",
          color: "#000",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        Elegir imágenes
      </label>
      <input
        id="file-upload"
        type="file"
        multiple
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {images.length > 0 && (
        <div style={{ marginTop: "1rem", marginBottom: "3rem" }}>
          <button
            onClick={handleClearAll}
            style={{ marginRight: "1rem", backgroundColor: "#e61919" }}
          >
            Eliminar todas
          </button>
          <button
            onClick={handleConvert}
            style={{ marginRight: "1rem", backgroundColor: "#439b31ff" }}
          >
            Convertir a WebP
          </button>
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label>Ancho deseado (px): </label>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          min={1}
        />
      </div>

      {/* Vista previa */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {images.map(({ file, previewUrl }, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <img
              src={previewUrl}
              alt={file.name}
              style={{ width: "150px", height: "auto", borderRadius: "4px" }}
            />
            <p style={{ fontSize: "0.8rem" }}>{file.name}</p>
            <button onClick={() => handleRemoveImage(index)}>Eliminar</button>
          </div>
        ))}
      </div>

      {/* Botón Eliminar todas */}
    </div>
  );
};

export default ImageConverter;
