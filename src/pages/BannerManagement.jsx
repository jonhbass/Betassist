import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';
import { removeAuthUser } from '../utils/auth';
import { getServerUrl } from '../utils/serverUrl';
import '../css/admin.css';

export default function BannerManagement() {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const serverUrl = getServerUrl();
        const res = await fetch(`${serverUrl}/banners`);
        if (res.ok) {
          const data = await res.json();
          setBanners(Array.isArray(data) ? data : []);
        } else {
          const stored = localStorage.getItem('BANNERS');
          setBanners(stored ? JSON.parse(stored) : []);
        }
      } catch (err) {
        console.error('Failed to load banners', err);
        const stored = localStorage.getItem('BANNERS');
        setBanners(stored ? JSON.parse(stored) : []);
      }
    };
    loadBanners();
  }, []);

  const [bannerUrl, setBannerUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'url' ou 'file'
  const [previewUrl, setPreviewUrl] = useState('');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Colapsar sidebar no mobile por padrão
    if (window.innerWidth && window.innerWidth < 900) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  function handleLogout() {
    removeAuthUser();
    navigate('/admin-login', { replace: true });
  }

  function handlePreview() {
    if (uploadMode === 'url') {
      if (!bannerUrl.trim()) {
        showToast('❌ Ingrese una URL válida');
        return;
      }
      setPreviewUrl(bannerUrl.trim());
    } else if (uploadMode === 'file') {
      if (!selectedFile) {
        showToast('❌ Selecione um arquivo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar se é imagem
      if (!file.type.startsWith('image/')) {
        showToast('❌ Seleccione solo archivos de imagen');
        e.target.value = '';
        return;
      }
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Imagen muy grande. Máximo 5MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  }

  function handleAddBanner(e) {
    e.preventDefault();

    let bannerData;

    if (uploadMode === 'url') {
      if (!bannerUrl.trim()) {
        showToast('❌ Ingrese una URL de imagen');
        return;
      }

      // Validação básica de URL
      try {
        new URL(bannerUrl.trim());
      } catch {
        showToast('❌ URL inválida');
        return;
      }

      bannerData = {
        id: Date.now(),
        url: bannerUrl.trim(),
        type: 'url',
        addedAt: new Date().toISOString(),
      };
    } else {
      // Upload de arquivo local
      if (!selectedFile) {
        showToast('❌ Selecione um arquivo');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const newBanner = {
          id: Date.now(),
          url: reader.result, // base64
          type: 'file',
          fileName: selectedFile.name,
          addedAt: new Date().toISOString(),
        };

        // Persist to server (which handles Cloudinary upload)
        const serverUrl = getServerUrl();
        setIsUploading(true);
        try {
          showToast('⏳ Enviando imagem...');
          const res = await fetch(`${serverUrl}/banners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBanner),
          });

          if (res.ok) {
            const updatedList = await res.json();
            if (Array.isArray(updatedList)) {
              setBanners(updatedList);
              // Atualiza cache local apenas para leitura rápida futura
              localStorage.setItem('BANNERS', JSON.stringify(updatedList));
              showToast('✅ Banner adicionado com sucesso');
            } else {
              console.error('Resposta inválida do servidor:', updatedList);
              showToast('❌ Erro: Resposta inválida do servidor');
            }
          } else {
            throw new Error('Erro no servidor');
          }
        } catch (err) {
          console.error('Failed to create banner on server', err);
          showToast('❌ Erro ao enviar banner');
        } finally {
          setIsUploading(false);
        }

        setSelectedFile(null);
        setPreviewUrl('');
        // Reset file input
        const fileInput = document.getElementById('banner-file');
        if (fileInput) fileInput.value = '';
      };
      reader.readAsDataURL(selectedFile);
      return;
    }

    const updatedBanners = [...banners, bannerData];
    // Otimista update
    setBanners(updatedBanners);

    // Persist to server
    const serverUrl = getServerUrl();
    setIsUploading(true);
    (async () => {
      try {
        const res = await fetch(`${serverUrl}/banners`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerData),
        });
        if (res.ok) {
          const serverList = await res.json();
          if (Array.isArray(serverList)) {
            setBanners(serverList);
            localStorage.setItem('BANNERS', JSON.stringify(serverList));
          }
        }
      } catch (err) {
        console.error('Failed to create banner on server', err);
        showToast('❌ Erro ao salvar banner no servidor');
      } finally {
        setIsUploading(false);
      }
    })();

    setBannerUrl('');
    setPreviewUrl('');
    showToast('✅ Banner adicionado com sucesso');
  }

  async function handleDeleteBanner(bannerId) {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    // Delete from server
    const serverUrl = getServerUrl();
    try {
      const res = await fetch(`${serverUrl}/banners/${bannerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const updatedList = await res.json();
        setBanners(updatedList);
        localStorage.setItem('BANNERS', JSON.stringify(updatedList));
        showToast('✅ Banner excluído');
      }
    } catch (err) {
      console.error('Failed to delete banner on server', err);
      showToast('❌ Erro ao excluir banner');
    }
  }

  function handleImageError(e) {
    e.target.src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23333" width="800" height="400"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-size="24"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
  }

  function formatDate(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  }

  return (
    <div className="ba-dashboard">
      {toast && <Toast message={toast} />}

      <Topbar
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        adminMode={true}
      />

      <main className="ba-main">
        <div className="ba-layout">
          {/* Overlay escuro quando sidebar está aberto no mobile */}
          {sidebarOpen && (
            <div
              className="ba-sidebar-overlay"
              onClick={toggleSidebar}
              aria-label="Cerrar menú lateral"
            />
          )}

          <aside className={`ba-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
            <AdminSidebar
              isOpen={sidebarOpen}
              onNavigateToSection={() => navigate('/admin')}
              onToast={showToast}
              onToggleSidebar={toggleSidebar}
            />
          </aside>

          <div className="ba-content">
            <div className="ba-admin-container">
              <h1 className="ba-admin-title">Gestionar Banners</h1>

              {/* Formulário para adicionar banner */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">Agregar Nuevo Banner</h2>

                {/* Seletor de modo */}
                <div className="ba-upload-mode-selector">
                  <button
                    type="button"
                    className={`ba-mode-btn ${
                      uploadMode === 'file' ? 'active' : ''
                    }`}
                    onClick={() => setUploadMode('file')}
                  >
                    📁 Arquivo Local
                  </button>
                  <button
                    type="button"
                    className={`ba-mode-btn ${
                      uploadMode === 'url' ? 'active' : ''
                    }`}
                    onClick={() => setUploadMode('url')}
                  >
                    🔗 URL
                  </button>
                </div>

                <form className="ba-admin-form" onSubmit={handleAddBanner}>
                  {uploadMode === 'url' ? (
                    <div className="ba-form-group">
                      <label htmlFor="banner-url">
                        URL da Imagem do Banner
                      </label>
                      <input
                        id="banner-url"
                        type="text"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="https://ejemplo.com/banner.jpg"
                        autoComplete="off"
                      />
                      <small
                        style={{
                          color: 'rgba(255,255,255,0.6)',
                          marginTop: '0.5rem',
                        }}
                      >
                        Recomendado: 1920x600px o proporción 16:5
                      </small>
                    </div>
                  ) : (
                    <div className="ba-form-group">
                      <label>Seleccionar Imagen</label>
                      <div className="ba-file-upload-wrapper">
                        <label
                          htmlFor="banner-file"
                          className="ba-file-upload-btn"
                        >
                          📁 Elegir Archivo
                        </label>
                        <span className="ba-file-upload-text">
                          {selectedFile
                            ? selectedFile.name
                            : 'Ningún archivo seleccionado'}
                        </span>
                        <input
                          id="banner-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="ba-file-input-hidden"
                        />
                      </div>
                      {selectedFile && (
                        <div className="ba-file-info">
                          <span>📎 {selectedFile.name}</span>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      )}
                      <small
                        style={{
                          color: 'rgba(255,255,255,0.6)',
                          marginTop: '0.5rem',
                          textAlign: 'center',
                          display: 'block',
                        }}
                      >
                        Formatos: JPG, PNG, GIF, WEBP | Máximo: 5MB
                      </small>
                    </div>
                  )}

                  <div className="ba-form-actions">
                    <button
                      type="submit"
                      className="ba-btn primary"
                      disabled={isUploading}
                    >
                      {isUploading ? '⏳ Enviando...' : '➕ Agregar Banner'}
                    </button>
                    <button
                      type="button"
                      className="ba-btn secondary"
                      onClick={handlePreview}
                      disabled={isUploading}
                    >
                      👁️ Vista Previa
                    </button>
                  </div>
                </form>

                {/* Preview do banner */}
                {previewUrl && (
                  <div className="ba-banner-preview">
                    <h3 style={{ color: '#b3e5fc', marginBottom: '1rem' }}>
                      Vista Previa del Banner:
                    </h3>
                    <div className="ba-preview-container">
                      <img
                        src={previewUrl}
                        alt="Preview do banner"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de banners */}
              <div className="ba-admin-section">
                <h2 className="ba-section-title">
                  Banners Registrados ({banners?.length || 0})
                </h2>

                {!banners || !Array.isArray(banners) || banners.length === 0 ? (
                  <div className="ba-empty-state">
                    <p>Ningún banner registrado aún.</p>
                    <p>
                      Use el formulario de arriba para agregar banners vía URL o
                      archivo local.
                    </p>
                  </div>
                ) : (
                  <div className="ba-banners-grid">
                    {banners.map((banner) => (
                      <div key={banner.id} className="ba-banner-card">
                        <div className="ba-banner-image">
                          <img
                            src={banner.url}
                            alt={banner.fileName || `Banner ${banner.id}`}
                            onError={handleImageError}
                          />
                        </div>
                        <div className="ba-banner-info">
                          <div className="ba-banner-url">
                            <strong>
                              {banner.type === 'file' ? 'Archivo:' : 'URL:'}
                            </strong>
                            {banner.type === 'file' ? (
                              <span className="ba-banner-filename">
                                {banner.fileName}
                              </span>
                            ) : (
                              <a
                                href={banner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ba-banner-link"
                              >
                                {banner.url.length > 50
                                  ? banner.url.substring(0, 50) + '...'
                                  : banner.url}
                              </a>
                            )}
                          </div>
                          <div className="ba-banner-date">
                            <strong>Agregado el:</strong>{' '}
                            {formatDate(banner.addedAt)}
                          </div>
                          <button
                            className="ba-btn small danger"
                            onClick={() => handleDeleteBanner(banner.id)}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ba-info-box">
                <h3>ℹ️ Informações Importantes</h3>
                <ul>
                  <li>
                    Los banners personalizados se mostrarán en el carrossel del
                    Dashboard
                  </li>
                  <li>
                    Se recomienda usar imágenes con proporción 16:5 (ej:
                    1920x600px)
                  </li>
                  <li>Puede agregar banners vía URL o subir archivo local</li>
                  <li>Formatos soportados: JPG, PNG, GIF, WEBP (máx 5MB)</li>
                  <li>
                    Los banners se mostrarán automáticamente en el carrossel del
                    Dashboard
                  </li>
                  <li>
                    Mantenha sempre pelo menos 1 banner cadastrado para melhor
                    experiência
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
