/* Editor de la protagonista: formulario nativo accesible y vista previa de la textura Phaser. */
'use strict';
const Personalizacion=(()=>{
  const CLAVE='huye_protagonista_v1';
  const CABELLOS=[['castano','Castaño','#704a35'],['negro','Negro','#292733'],['rubio','Rubio','#d6b875'],['cobrizo','Cobrizo','#b35e3d'],['rosa','Rosa','#cb719e'],['plata','Plata','#c6cad2']];
  const OJOS=[['castanos','Castaños','#795035'],['azules','Azules','#4d9ebc'],['verdes','Verdes','#638958'],['miel','Miel','#ba904a'],['violetas','Violetas','#9273b2']];
  const PRENDAS=[['vestido','Vestido rosa'],['chaqueta','Chaqueta verde'],['overol','Overol de mezclilla']];
  function validar(valor){
    const v=valor&&typeof valor==='object'?valor:{};
    const nombre=typeof v.nombre==='string'?Array.from(v.nombre.replace(/[\u0000-\u001f\u007f]/g,'').trim()).slice(0,18).join(''):'';
    return {nombre:nombre||'Isabella',cabello:CABELLOS.some(c=>c[0]===v.cabello)?v.cabello:'castano',ojos:OJOS.some(c=>c[0]===v.ojos)?v.ojos:'castanos',ropa:PRENDAS.some(c=>c[0]===v.ropa)?v.ropa:'vestido'};
  }
  function cargar(){try{return validar(JSON.parse(localStorage.getItem(CLAVE)));}catch(_){return validar(null);}}
  function mostrar(s,actual,alGuardar){
    if(document.getElementById('editor-prota'))return;
    const dialog=document.createElement('dialog');dialog.id='editor-prota';dialog.setAttribute('aria-labelledby','editor-titulo');
    const opciones=(grupo,lista)=>lista.map(([id,label,color])=>`<label class="look-option"><input type="radio" name="${grupo}" value="${id}">${color?`<span class="look-swatch" style="background:${color}"></span>`:''}<span>${label}</span></label>`).join('');
    dialog.innerHTML=`<form class="look-form"><header><p class="look-eyebrow">TU HISTORIA EMPIEZA CONTIGO</p><h2 id="editor-titulo">Crea a tu protagonista <span>♡</span></h2><p>Elige tu look y sal de este drama con estilo.</p></header><div class="look-layout"><div class="look-preview"><span class="look-badge">PIXEL GIRL</span><img id="look-retrato" alt="Vista previa de tu protagonista en pixel art" width="162" height="192"><strong id="look-nombre"></strong><span>Lista para elegir su paz ✦</span></div><div class="look-fields"><label class="look-name" for="prota-nombre">¿Cómo te llamas?<input id="prota-nombre" name="nombre" type="text" maxlength="18" autocomplete="off" placeholder="Nombre de tu protagonista" aria-describedby="nombre-ayuda"><small id="nombre-ayuda">Hasta 18 caracteres. Si lo dejas vacío, serás Isabella.</small></label><fieldset><legend>Color de cabello</legend><div class="look-options">${opciones('cabello',CABELLOS)}</div></fieldset><fieldset><legend>Color de ojos</legend><div class="look-options">${opciones('ojos',OJOS)}</div></fieldset><fieldset><legend>Tu outfit</legend><div class="look-options look-outfits">${opciones('ropa',PRENDAS)}</div></fieldset></div></div><footer><span id="look-guardado">Tu look se recordará en este navegador.</span><button type="submit">¡Esa soy yo! →</button></footer></form>`;
    document.body.appendChild(dialog);
    const form=dialog.querySelector('form'),nombre=form.elements.namedItem('nombre');
    const tecladoAntes=s.input.keyboard.enabled;
    const capturasAntes=s.input.keyboard.manager.captures.slice();
    s.input.keyboard.enabled=false;s.input.keyboard.removeAllCaptures();
    nombre.value=actual.nombre;
    for(const grupo of ['cabello','ojos','ropa'])form.elements.namedItem(grupo).value=actual[grupo];
    function leer(){return validar({nombre:nombre.value,cabello:form.elements.namedItem('cabello').value,ojos:form.elements.namedItem('ojos').value,ropa:form.elements.namedItem('ropa').value});}
    function actualizar(){
      const elegida=leer(),key=SpritesJuego.configurarProta(s,elegida);
      dialog.querySelector('#look-retrato').src=s.textures.get(key).getSourceImage().toDataURL();
      dialog.querySelector('#look-nombre').textContent=elegida.nombre;
    }
    form.addEventListener('input',actualizar);form.addEventListener('change',actualizar);
    dialog.addEventListener('cancel',e=>e.preventDefault());
    form.addEventListener('submit',e=>{
      e.preventDefault();const elegida=leer();
      try{localStorage.setItem(CLAVE,JSON.stringify(elegida));}catch(_){}
      dialog.close();dialog.remove();s.input.keyboard.enabled=tecladoAntes;
      s.input.keyboard.resetKeys();s.input.keyboard.addCapture(capturasAntes);
      window.resetearMovimientoTactil?.();alGuardar(elegida);
    });
    actualizar();dialog.showModal();
  }
  return {cargar,validar,mostrar};
})();
