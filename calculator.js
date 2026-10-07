(() => {
  function calculate(kind, mode, entered) {
    if (!['tri', 'quad'].includes(kind) || !['closed', 'open'].includes(mode)) throw new Error('Elegí un tipo y una medida válidos.');
    if (typeof entered !== 'number' || !Number.isFinite(entered) || entered <= 0) throw new Error('Ingresá una medida válida.');
    const count = kind === 'tri' ? 3 : 4;
    const deduction = kind === 'tri' ? 2 : 6;
    const x = mode === 'closed' ? entered : (entered + deduction) / count;
    const panels = kind === 'tri' ? [x - 2, x, x] : [x, x, x - 2, x - 4];
    const openWidth = count * x - deduction;
    if (!Number.isFinite(openWidth) || panels.some(n => !Number.isFinite(n) || n <= 0)) throw new Error('La medida es demasiado pequeña para aplicar esta compensación.');
    return { x, panels, openWidth };
  }
  if (typeof module !== 'undefined') module.exports = { calculate };
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const fmt = n => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);
  let kind = 'quad', mode = 'closed';
  function current() { return calculate(kind, mode, Number($('measure').value)); }
  function setMode(next) {
    let result; try { result = current(); } catch (_) {}
    mode = next;
    if (result) $('measure').value = mode === 'closed' ? result.x : result.openWidth;
    update();
  }
  function setKind(next) {
    let x; try { x = current().x; } catch (_) {}
    kind = next;
    if (x) $('measure').value = mode === 'closed' ? x : calculate(kind, 'closed', x).openWidth;
    update();
  }
  function update() {
    for (const [id, active] of [['closedBtn',mode==='closed'],['openBtn',mode==='open'],['triBtn',kind==='tri'],['quadBtn',kind==='quad']]) {
      $(id).classList.toggle('active', active); $(id).setAttribute('aria-pressed', String(active));
    }
    const tri = kind === 'tri';
    $('inputLabel').textContent = mode === 'closed' ? 'Ancho cerrado (portada / contraportada)' : 'Ancho total abierto';
    $('helper').textContent = mode === 'closed' ? 'X es el ancho de la portada y la contraportada.' : 'Se obtiene X a partir del ancho total, incluyendo la compensación de las solapas.';
    $('resultLabel').textContent = mode === 'closed' ? 'Ancho total abierto' : 'Ancho cerrado (portada)';
    $('measure').min = mode === 'closed' ? (tri ? '2.01' : '4.01') : (tri ? '4.01' : '10.01');
    $('orientation').textContent = tri ? 'Vista exterior · izquierda: solapa interna; centro: contraportada; derecha: portada.' : 'Vista exterior · tapa, contratapa y dos solapas internas.';
    $('note').textContent = tri
      ? 'Tríptico envolvente: solo la solapa interna se reduce 2 mm. Distribución exterior: X − 2 / X / X. La tolerancia puede variar según gramaje, plastificado, hendido y criterio de la imprenta. Confirmar medidas antes de producción.'
      : 'Cuadríptico envolvente: reducción progresiva de 2 mm. Distribución: X / X / X − 2 / X − 4. La tolerancia puede variar según gramaje, plastificado, hendido y criterio de la imprenta. Confirmar medidas antes de producción.';
    let result;
    try { result = current(); } catch (e) {
      $('error').textContent = e.message; $('error').style.display = 'block'; $('measure').setAttribute('aria-invalid','true');
      $('mainResult').textContent = '—'; $('formula').textContent = 'Ingresá una medida válida para calcular.'; $('closedChip').textContent = 'Cerrado: —'; $('diagram').replaceChildren(); return;
    }
    $('error').style.display = 'none'; $('measure').removeAttribute('aria-invalid');
    const labels = tri ? ['Solapa interna','Contraportada','Portada'] : ['Tapa','Contratapa','1.ª solapa interna','2.ª solapa interna'];
    const rules = tri ? ['X − 2 mm','X','X'] : ['X','X','X − 2 mm','X − 4 mm'];
    $('diagram').replaceChildren();
    $('diagram').style.gridTemplateColumns = result.panels.map(n => n + 'fr').join(' ');
    $('diagram').setAttribute('aria-label', 'Distribución de palas del ' + (tri ? 'tríptico' : 'cuadríptico'));
    result.panels.forEach((n,i) => {
      const panel = document.createElement('div'); panel.className = 'panel' + ((tri ? i===0 : i>1) ? ' flap' : '');
      for (const [className, text] of [['panel-name',labels[i]],['panel-value',fmt(n)+' mm'],['panel-rule',rules[i]]]) {
        const line = document.createElement('div'); line.className = className; line.textContent = text; panel.append(line);
      }
      $('diagram').append(panel);
    });
    $('formula').textContent = result.panels.map(fmt).join(' + ') + ' = ' + fmt(result.openWidth) + ' mm';
    $('closedChip').textContent = 'Cerrado: ' + fmt(result.x) + ' mm';
    $('mainResult').textContent = fmt(mode==='closed' ? result.openWidth : result.x) + ' mm';
  }
  $('closedBtn').addEventListener('click', () => setMode('closed'));
  $('openBtn').addEventListener('click', () => setMode('open'));
  $('triBtn').addEventListener('click', () => setKind('tri'));
  $('quadBtn').addEventListener('click', () => setKind('quad'));
  $('measure').addEventListener('input', update);
  update();
})();
