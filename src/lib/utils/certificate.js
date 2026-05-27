import { ApiUrls, apiFetch } from '$lib/api.js';
import { showError, showInfo } from '$lib/utils/toast.js';

// Floating action bar injected into the certificate window after the print
// dialog closes. Hidden on print via @media print so it never appears on paper
// or in the saved PDF. The certificate HTML itself (from the edge function)
// is not modified.
const ACTION_BAR_HTML = (filename) => `
<style>
  #__cert_actions {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 9999;
    display: flex;
    gap: 8px;
    padding: 8px;
    background: rgba(255,255,255,0.95);
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  #__cert_actions button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color 120ms;
  }
  #__cert_actions button.primary {
    background: #2563eb;
    color: #fff;
  }
  #__cert_actions button.primary:hover { background: #1d4ed8; }
  #__cert_actions button.secondary {
    background: #fff;
    color: #374151;
    border-color: #d1d5db;
  }
  #__cert_actions button.secondary:hover { background: #f3f4f6; }
  #__cert_actions button.ghost {
    background: transparent;
    color: #6b7280;
  }
  #__cert_actions button.ghost:hover { background: #f3f4f6; color: #111827; }
  @media print {
    #__cert_actions { display: none !important; }
  }
</style>
<div id="__cert_actions" role="toolbar" aria-label="Acciones del certificado">
  <button type="button" class="primary" data-action="print">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
    Imprimir
  </button>
  <button type="button" class="secondary" data-action="pdf">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    Descargar PDF
  </button>
  <button type="button" class="ghost" data-action="close" aria-label="Cerrar">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  </button>
</div>
<script>
(function(){
  var bar = document.getElementById('__cert_actions');
  if (!bar) return;
  var filename = ${JSON.stringify(filename)};
  bar.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;
    if (action === 'print' || action === 'pdf') {
      var prev = document.title;
      if (action === 'pdf') document.title = filename;
      setTimeout(function(){
        window.print();
        setTimeout(function(){ document.title = prev; }, 1000);
      }, 50);
    } else if (action === 'close') {
      window.close();
    }
  });
})();
</script>
`;

function appendActionBar(win, avaluoId) {
  try {
    const filename = `certificado_${avaluoId}`;
    const doc = win.document;
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = ACTION_BAR_HTML(filename);
    // Append nodes one by one so the inline <script> actually executes.
    while (wrapper.firstChild) {
      const node = wrapper.firstChild;
      if (node.tagName === 'SCRIPT') {
        const s = doc.createElement('script');
        s.text = node.textContent;
        doc.body.appendChild(s);
        wrapper.removeChild(node);
      } else {
        doc.body.appendChild(node);
      }
    }
  } catch {
    /* ignore — best-effort overlay */
  }
}

/**
 * Open the appraisal certificate in a new window — handles both the HTML and
 * PDF variants returned by `certificates-appraisal` and falls back to a
 * download when the popup blocker kicks in. For the HTML variant the window
 * also gets a floating action bar with Print / Download PDF / Close buttons
 * that disappears at print time (`@media print { display:none }`).
 */
export async function printCertificate(avaluoId) {
  try {
    const response = await apiFetch(ApiUrls.CERTIFICADOS.get(avaluoId));
    if (!response.ok) {
      let errMsg = `Error ${response.status}`;
      try {
        const j = await response.json();
        errMsg = j.detail || j.message || errMsg;
      } catch {
        /* ignore */
      }
      throw new Error(errMsg);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/pdf')) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const newWin = window.open(url, '_blank');
      if (!newWin) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado_${avaluoId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showInfo('El certificado se está descargando. Revisa tu carpeta de descargas.');
      }
      return;
    }

    const htmlText = await response.text();
    if (htmlText.trimStart().startsWith('{')) {
      try {
        const j = JSON.parse(htmlText);
        throw new Error(j.detail || j.message || 'Error al generar el certificado');
      } catch (e) {
        if (!(e instanceof SyntaxError)) throw e;
      }
    }
    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.open();
      newWin.document.write(htmlText);
      newWin.document.close();
      const wireUp = () => {
        appendActionBar(newWin, avaluoId);
        try {
          newWin.print();
        } catch {
          /* ignore */
        }
      };
      if (newWin.document.readyState === 'complete') {
        wireUp();
      } else {
        newWin.addEventListener('load', wireUp, { once: true });
        // Fallback in case `load` never fires (some browsers with about:blank).
        setTimeout(() => {
          if (!newWin.document.getElementById('__cert_actions')) wireUp();
        }, 800);
      }
    } else {
      const blob = new Blob([htmlText], { type: 'text/html; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado_${avaluoId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showInfo('El certificado se descargó. Ábrelo en el navegador y usa Imprimir → Guardar como PDF.');
    }
  } catch (error) {
    showError(`Error al obtener el certificado: ${error.message}`);
  }
}
