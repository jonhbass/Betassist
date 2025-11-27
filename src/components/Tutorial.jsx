import { useState, useEffect } from 'react';
import '../css/tutorial.css';

const tutorialStepsDesktop = [
  {
    id: 1,
    target: '.ba-sidebar',
    title: '📱 Menú Lateral',
    description:
      'Aquí encontrarás las opciones principales: Cargar Fichas, Retirar Fichas, Historial y Configuraciones.',
    position: 'right',
  },
  {
    id: 2,
    target: '.ba-welcome',
    title: '👋 Bienvenida',
    description:
      'Este es tu nombre de usuario. Aquí verás tu información personalizada.',
    position: 'bottom',
  },
  {
    id: 3,
    target: '.ba-chat',
    title: '💬 Chat Global',
    description:
      'Chatea con otros usuarios en tiempo real. Comparte estrategias y mantente conectado con la comunidad.',
    position: 'center', // Centralizado para não sair da tela
  },
  {
    id: 4,
    target: '.ba-notify-btn',
    title: '🔔 Notificaciones',
    description:
      'Recibe actualizaciones sobre tus depósitos y retiros. El contador muestra notificaciones sin leer.',
    position: 'bottom',
  },
  {
    id: 5,
    target: '.ba-balance',
    title: '💰 Tu Saldo',
    description:
      'Aquí puedes ver tu saldo actual. Se actualiza automáticamente cuando realizas depósitos o retiros.',
    position: 'bottom',
  },
  {
    id: 6,
    target: '.ba-message-btn', // Corrigido de '.ba-support-button' para '.ba-message-btn'
    title: '💬 Mensajes de Soporte',
    description:
      'Necesitas ayuda? Haz clic aquí para abrir el chat de soporte. Un administrador te responderá lo antes posible.',
    position: 'bottom', // Alterado de 'left' para 'bottom' para melhor visualização
  },
];

const tutorialStepsMobile = [
  {
    id: 1,
    target: '.ba-sidebar-toggle-btn',
    title: '📱 Menú Lateral',
    description:
      'Toca este botón para abrir el menú lateral con todas las opciones: Cargar Fichas, Retirar Fichas e Historial.',
    position: 'bottom',
  },
  {
    id: 2,
    target: '.ba-welcome',
    title: '👋 Bienvenida',
    description:
      'Este es tu nombre de usuario. Aquí verás tu información personalizada.',
    position: 'bottom',
  },
  {
    id: 3,
    target: '.ba-chat',
    title: '💬 Chat Global',
    description:
      'Chatea con otros usuarios en tiempo real. Desliza para ver más mensajes.',
    position: 'top',
  },
  {
    id: 4,
    target: '.ba-notify-btn',
    title: '🔔 Notificaciones',
    description:
      'Toca aquí para ver tus notificaciones de depósitos y retiros. El número indica notificaciones sin leer.',
    position: 'bottom',
  },
  {
    id: 5,
    target: '.ba-menu-toggle-btn',
    title: '⚙️ Menú de Usuario',
    description:
      'Aquí puedes ver tu saldo, hacer recargas rápidas, retiros y cerrar sesión.',
    position: 'bottom',
  },
  {
    id: 6,
    target: '.ba-message-btn',
    title: '💬 Mensajes de Soporte',
    description:
      'Necesitas ayuda? Toca aquí para abrir el chat de soporte. Un administrador te responderá lo antes posible.',
    position: 'bottom',
  },
];

export default function Tutorial({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 899);

  // Detectar mudanças de tamanho de tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 899);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Selecionar steps baseado no tamanho da tela
  const tutorialSteps = isMobile ? tutorialStepsMobile : tutorialStepsDesktop;

  useEffect(() => {
    if (!isOpen) return;

    const step = tutorialSteps[currentStep];
    if (!step) return;

    // Encontrar elemento alvo
    const element = document.querySelector(step.target);
    if (!element) {
      console.warn(`Tutorial: elemento ${step.target} não encontrado`);
      return;
    }

    setTargetElement(element);

    // Scroll suave até o elemento
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Calcular posição do tooltip
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 380; // Largura máxima do tooltip
      const tooltipHeight = 300; // Altura estimada do tooltip
      const padding = 20; // Espaço de segurança
      let top = 0;
      let left = 0;

      // No mobile, sempre posicionar na parte inferior da tela
      if (window.innerWidth <= 899) {
        top = window.innerHeight - 200; // Posição fixa no mobile
        left = window.innerWidth / 2;
      } else {
        // Desktop: posicionamento relativo ao elemento com detecção de limites
        switch (step.position) {
          case 'center':
            // Centralizar o tooltip na tela (ideal para elementos grandes como o chat)
            top = window.innerHeight / 2;
            left = window.innerWidth / 2;
            break;

          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 20;

            // Verificar se sai pela direita
            if (left + tooltipWidth > window.innerWidth - padding) {
              // Posicionar à esquerda
              left = rect.left - tooltipWidth - 20;
            }
            // Se ainda sai, centralizar
            if (left < padding) {
              left = window.innerWidth / 2;
              top = window.innerHeight / 2;
            }
            break;

          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - tooltipWidth - 20;

            // Verificar se sai pela esquerda
            if (left < padding) {
              // Posicionar à direita
              left = rect.right + 20;
            }
            break;

          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2;

            // Verificar se sai pela direita
            if (left + tooltipWidth / 2 > window.innerWidth - padding) {
              left = window.innerWidth - tooltipWidth - padding;
            }
            // Verificar se sai pela esquerda
            if (left - tooltipWidth / 2 < padding) {
              left = tooltipWidth / 2 + padding;
            }

            // Verificar se sai por baixo
            if (top + tooltipHeight > window.innerHeight - padding) {
              // Posicionar acima
              top = rect.top - tooltipHeight - 20;
            }
            break;

          case 'top':
            top = rect.top - 20;
            left = rect.left + rect.width / 2;

            // Verificar se sai pela direita
            if (left + tooltipWidth / 2 > window.innerWidth - padding) {
              left = window.innerWidth - tooltipWidth - padding;
            }
            // Verificar se sai pela esquerda
            if (left - tooltipWidth / 2 < padding) {
              left = tooltipWidth / 2 + padding;
            }

            // Verificar se sai por cima
            if (top - tooltipHeight < padding) {
              // Posicionar abaixo
              top = rect.bottom + 20;
            }
            break;

          default:
            top = rect.bottom + 20;
            left = rect.left;
        }

        // Ajustar verticalmente se necessário
        if (top + tooltipHeight > window.innerHeight - padding) {
          top = window.innerHeight - tooltipHeight - padding;
        }
        if (top < padding) {
          top = padding;
        }
      }

      setTooltipPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isOpen, tutorialSteps]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (confirm('¿Seguro que quieres saltar el tutorial?')) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Marcar tutorial como concluído
    localStorage.setItem('tutorialCompleted', 'true');
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  if (!step) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div className="tutorial-overlay" onClick={handleSkip} />

      {/* Highlight do elemento */}
      {targetElement && (
        <div
          className="tutorial-highlight"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.offsetWidth + 16,
            height: targetElement.offsetHeight + 16,
          }}
        />
      )}

      {/* Tooltip do tutorial */}
      <div
        className={`tutorial-tooltip tutorial-tooltip-${step.position}`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="tutorial-header">
          <span className="tutorial-step">
            Paso {currentStep + 1} de {tutorialSteps.length}
          </span>
          <button className="tutorial-close" onClick={handleSkip}>
            ✕
          </button>
        </div>

        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-description">{step.description}</p>

        <div className="tutorial-footer">
          <button
            className="tutorial-btn tutorial-btn-secondary"
            onClick={handleSkip}
          >
            Saltar
          </button>

          <div className="tutorial-nav">
            {currentStep > 0 && (
              <button
                className="tutorial-btn tutorial-btn-secondary"
                onClick={handlePrev}
              >
                ← Anterior
              </button>
            )}
            <button
              className="tutorial-btn tutorial-btn-primary"
              onClick={handleNext}
            >
              {currentStep < tutorialSteps.length - 1
                ? 'Siguiente →'
                : '¡Entendido! ✓'}
            </button>
          </div>
        </div>

        {/* Indicadores de progresso */}
        <div className="tutorial-dots">
          {tutorialSteps.map((_, index) => (
            <span
              key={index}
              className={`tutorial-dot ${
                index === currentStep ? 'active' : ''
              } ${index < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
