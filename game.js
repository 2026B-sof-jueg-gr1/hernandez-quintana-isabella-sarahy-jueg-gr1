/* ¡HUYE, AMIGA, HUYE! - Edición capítulos
   Proyecto sencillo: Phaser 3 + JavaScript + HTML/CSS.
   Sin framework adicional, sin backend y sin base de datos.
*/
'use strict';

const W=960, H=600;
const VILLANOS=['Diego','Alexander','Nicolás'];
const AMIGAS=['Sami','Paul','Ali'];
const CAPITULOS=[
  {titulo:'El primer visto',sub:'Escapa de las primeras excusas.',suelo:0xfff4f9,borde:0xffc5db,planta:0xf5a8c8},
  {titulo:'El jardín del casi algo',sub:'No confundas una excusa con una flor.',suelo:0xf3fff9,borde:0xb6e9d8,planta:0x8ddcc3},
  {titulo:'La universidad de las indirectas',sub:'El parcial es sobrevivir al drama.',suelo:0xf7f4ff,borde:0xd6c7ff,planta:0xb6a6ed},
  {titulo:'El laberinto de los límites',sub:'Decir NO también abre caminos.',suelo:0xfff8ec,borde:0xffdcb4,planta:0xf1c491},
  {titulo:'Mi paz primero',sub:'Última parada: una salida saludable.',suelo:0xfff1f6,borde:0xfab5d2,planta:0xc0b4ef}
];
const RECOGIDAS=[[140,164],[420,156],[794,160],[258,303],[515,315],[760,303],[144,486],[410,494],[745,472],[610,186],[615,440],[305,493],[872,285]];

let estado='menu',modo='historia',capitulo=1,vida=1;
let escena,jugadora,chicos={},controles,teclasExtra,arbustos,comodas=[false,false,false];
let elementos=[],flores=[],banderas=[],meta,metaBrillo,panel=null,pantallaHUD,txtEstado,txtComodines,txtFrase,txtAviso;
let recogidas=0,necesarias=4,esquivadas=0,totalSegundos=0,etapaSegundos=0;
let congeladosHasta=0,inmuneHasta=0,andyDisponibleEn=0,ralentizadaHasta=0,banderaSiguiente=0,fraseSiguiente=0,avisoHasta=0,fraseHasta=0;
let colaFrases={},libroNombre='Diego';
let recordHistoria=0,recordInfinito=0;
let botonesPanel=[];
try{recordHistoria=Number(localStorage.getItem('huye_historia_tiempo')||0);recordInfinito=Number(localStorage.getItem('huye_infinito_etapas')||0);}catch(e){}

// NONE mantiene fijo el tamaño interno del canvas. Solo CSS adapta el elemento a la pantalla.
// Esto elimina el zoom progresivo que producía la combinación FIT + redimensionado CSS.
const configuracion={type:Phaser.AUTO,width:W,height:H,parent:'game',backgroundColor:'#fff1f8',
  physics:{default:'arcade',arcade:{debug:false}},
  scale:{mode:Phaser.Scale.NONE},pixelArt:false,
  scene:{create,update}};
new Phaser.Game(configuracion);

function alAzar(arr){return arr[Math.floor(Math.random()*arr.length)];}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function mezclar(arr){return Phaser.Utils.Array.Shuffle(arr.slice());}
function sacarFrase(nombre){
  if(!colaFrases[nombre]||colaFrases[nombre].length===0) colaFrases[nombre]=mezclar(FRASES[nombre]);
  return colaFrases[nombre].pop();
}
function tiempoFmt(v){return v.toFixed(1)+' s';}

// El arte es generado con gráficos básicos de Phaser (no hay imágenes externas).
function generarPersonaje(s,nombre,colorCamisa,colorPelo){
  const key='personaje_'+nombre;
  const g=s.make.graphics({x:0,y:0});
  // sombra, zapatos, piernas y ropa
  g.fillStyle(0x78536c,.18);g.fillEllipse(26,58,37,6);
  g.fillStyle(nombre==='chica'?0x8d4976:0x44394e);g.fillRect(13,48,9,10);g.fillRect(31,48,9,10);
  g.fillStyle(0x403144);g.fillRoundedRect(11,56,13,5,2);g.fillRoundedRect(30,56,13,5,2);
  g.fillStyle(colorCamisa);g.fillRoundedRect(11,29,32,22,nombre==='chica'?10:3);
  g.fillStyle(0xf3c3a2);g.fillRoundedRect(5,31,7,17,3);g.fillRoundedRect(43,31,7,17,3);
  // cara
  g.fillStyle(nombre==='Andy'?0xeebd99:0xf8c7ac);g.fillCircle(27,18,16);
  g.fillStyle(colorPelo);
  if(nombre==='chica'){
    g.fillEllipse(27,8,38,15);g.fillRoundedRect(10,10,9,23,4);g.fillRoundedRect(39,9,7,18,3);
    g.fillStyle(0xec61a5);g.fillTriangle(5,6,16,12,14,0);g.fillTriangle(18,11,28,4,18,1);g.fillCircle(16,7,4);
    g.fillStyle(0xffebf7);g.fillCircle(27,37,5);
  }else if(nombre==='Alexander'){
    g.fillTriangle(8,14,17,0,21,11);g.fillTriangle(19,11,27,-1,32,11);g.fillTriangle(31,11,43,1,43,17);
    g.fillStyle(0x765342);g.fillRect(8,13,6,7);
  }else if(nombre==='Diego'){
    g.fillEllipse(26,7,37,16);g.fillRect(9,8,9,13);g.fillRect(37,7,7,11);
    g.fillStyle(0x6d584d);g.fillRect(12,5,9,3);
  }else if(nombre==='Nicolás'){
    g.fillRoundedRect(8,3,37,12,3);g.fillRect(8,10,8,13);g.fillRect(38,8,7,10);
    g.fillStyle(0x69576a);g.fillRoundedRect(11,3,28,5,1);
  }else{
    g.fillEllipse(26,7,37,13);g.fillRect(9,9,8,8);g.fillRect(39,9,5,8);
  }
  // ojos y expresiones
  g.fillStyle(0x4a3343);g.fillCircle(20,20,2.4);g.fillCircle(33,20,2.4);
  if(nombre==='chica'){
    g.fillStyle(0xef8c9c);g.fillCircle(15,26,4);g.fillCircle(38,26,4);
    g.lineStyle(1.8,0x9b4a66);g.lineBetween(24,28,30,28);
  }else if(nombre==='Andy'){
    g.lineStyle(1.8,0x995b5e);g.lineBetween(22,28,26,30);g.lineBetween(26,30,31,28);
  }else{
    g.lineStyle(2.5,0x503647);g.lineBetween(14,14,23,15);g.lineBetween(30,15,40,12);
    g.lineBetween(23,29,33,28);
    if(nombre==='Alexander'){g.fillStyle(0xb9657a);g.fillCircle(43,27,3);}
    if(nombre==='Diego'){g.fillStyle(0xa4667d);g.fillRect(17,30,6,2);}
    if(nombre==='Nicolás'){g.lineStyle(1,0x6a526b);g.lineBetween(17,33,35,33);}
  }
  g.generateTexture(key,54,64);g.destroy();
  return key;
}
function crearSprites(s){
  generarPersonaje(s,'chica',0xf76ca8,0x6e375d);
  generarPersonaje(s,'Diego',0x999070,0x45392f);
  generarPersonaje(s,'Alexander',0xb5a94c,0x4b3029);
  generarPersonaje(s,'Nicolás',0x8c7b9a,0x383146);
  generarPersonaje(s,'Andy',0x5da7d1,0x533e31);
}

function create(){
  escena=this;
  this.cameras.main.setBackgroundColor('#fff4f9');
  this.physics.world.setBounds(20,100,920,450);
  crearSprites(this);
  arbustos=this.physics.add.staticGroup();
  jugadora=this.physics.add.sprite(136,310,'personaje_chica').setDepth(13).setCollideWorldBounds(true);
  jugadora.body.setSize(32,32).setOffset(11,24);
  jugadora.setVisible(false).setActive(false).body.enable=false;
  const puntos={Diego:[861,148],Alexander:[870,486],Nicolás:[470,145],Andy:[140,502]};
  for(const nombre of [...VILLANOS,'Andy']){
    const [x,y]=puntos[nombre];
    const ch=this.physics.add.sprite(x,y,'personaje_'+nombre).setDepth(12).setCollideWorldBounds(true);
    ch.body.setSize(31,32).setOffset(12,24);
    ch.setVisible(false).setActive(false).body.enable=false;
    chicos[nombre]=ch;
  }
  this.physics.add.collider(jugadora,arbustos);
  controles=this.input.keyboard.createCursorKeys();
  teclasExtra=this.input.keyboard.addKeys('W,A,S,D,ONE,TWO,THREE');
  pantallaHUD=this.add.container(0,0).setDepth(30);
  const fondoHUD=this.add.rectangle(480,45,960,90,0xffffff,.91);
  const linea=this.add.rectangle(480,88,960,4,0xf69cc3);
  const marca=this.add.text(25,18,'💗 HUYE, AMIGA',{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#a53574'});
  txtEstado=this.add.text(25,50,'',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#8c497a'});
  txtComodines=this.add.text(936,18,'',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#925477'}).setOrigin(1,0);
  const ayuda=this.add.text(938,52,'WASD / Flechas  •  1, 2, 3: comodines',{fontFamily:'Arial',fontSize:'13px',color:'#a37a95'}).setOrigin(1,0);
  pantallaHUD.add([fondoHUD,linea,marca,txtEstado,txtComodines,ayuda]);
  pantallaHUD.setVisible(false);
  const banda=this.add.rectangle(480,575,960,50,0xffffff,.86).setDepth(30);
  txtFrase=this.add.text(480,572,'',{fontFamily:'Arial',fontSize:'15px',color:'#87456a',align:'center',wordWrap:{width:870}}).setOrigin(.5).setDepth(31);
  txtAviso=this.add.text(480,110,'',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#a33471',align:'center',wordWrap:{width:840}}).setOrigin(.5).setDepth(40);
  banda.setVisible(false);txtFrase.setVisible(false);txtAviso.setVisible(false);
  this.data.set('banda',banda);
  dibujarMenu(this);
  window.usarComodin=(n)=>activarComodin(this,n,false,this.time.now);
  window.huyeEstaJugando=()=>estado==='jugando';
}

function liberarEscenario(){
  elementos.forEach(obj=>{if(obj&&obj.active)obj.destroy()});elementos=[];
  flores.forEach(o=>{if(o.aro?.active)o.aro.destroy();if(o.icono?.active)o.icono.destroy()});flores=[];
  banderas.forEach(b=>{if(b.obj&&b.obj.active)b.obj.destroy()});banderas=[];
  if(meta&&meta.active)meta.destroy();meta=null;
  if(metaBrillo&&metaBrillo.active)metaBrillo.destroy();metaBrillo=null;
  arbustos.clear(true,true);
}
function crearFondo(s,tema){
  const g=s.add.graphics().setDepth(-3);
  g.fillStyle(tema.suelo);g.fillRect(0,0,W,H);
  g.fillStyle(0xffffff,.3);
  for(let x=28;x<960;x+=48)for(let y=104;y<560;y+=48)g.fillCircle(x,y,1.5);
  g.lineStyle(6,tema.borde,.9);g.strokeRoundedRect(22,102,916,449,20);
  // esquinas y caminos decorativos (sin coste en físicas)
  g.fillStyle(0xffffff,.33);
  g.fillRoundedRect(28,110,902,433,15);
  g.fillStyle(tema.suelo,.85);g.fillRoundedRect(34,116,890,421,12);
  elementos.push(g);
  for(let i=0;i<18;i++){
    const x=Phaser.Math.Between(43,914),y=Phaser.Math.Between(119,535);
    const spt=s.add.text(x,y,alAzar(['✿','·','♥','✦']),{fontFamily:'Arial',fontSize:'16px',color:i%2?'#e8bfd6':'#d9c7f6'}).setAlpha(.42).setDepth(-1);
    elementos.push(spt);
  }
}
function crearJardin(s,cap){
  const c=CAPITULOS[(cap-1)%CAPITULOS.length];
  const posiciones=[
    [280,246,122,26],[645,257,130,28],[395,429,128,28],[737,425,110,27],
    [310,371,95,24],[600,371,112,28],[456,203,90,24]
  ];
  const cantidad=Math.min(4+Math.floor((cap-1)/2),7);
  for(const [cx,cy,w,h] of posiciones.slice(0,cantidad)){
    const sombra=s.add.rectangle(cx,cy+5,w+8,h+7,0xcf9db4,.17).setDepth(0);elementos.push(sombra);
    const planta=s.add.rectangle(cx,cy,w,h,c.planta,.92).setStrokeStyle(3,0xffffff,.8).setDepth(3);
    arbustos.add(planta);
    if(planta.body&&planta.body.updateFromGameObject)planta.body.updateFromGameObject();
    for(let k=-1;k<=1;k++){
      const flor=s.add.text(cx+k*(w/4),cy-2,k===0?'✿':'❀',{fontSize:'18px',color:k===0?'#ffffff':'#fef2fa',fontFamily:'Arial'}).setOrigin(.5).setDepth(4);
      elementos.push(flor);
    }
  }
}
function crearCorazones(s,cant){
  const sitios=mezclar(RECOGIDAS.filter(([x,y])=>Math.hypot(x-136,y-310)>90 && Math.hypot(x-864,y-485)>75));
  for(const [x,y] of sitios.slice(0,cant)){
    const aro=s.add.circle(x,y,19,0xffb5db,.45).setStrokeStyle(2,0xffffff).setDepth(5);
    const icono=s.add.text(x,y,'💗',{fontSize:'27px'}).setOrigin(.5).setDepth(6);
    flores.push({x,y,aro,icono,tomada:false});
  }
}
function crearSalida(s){
  const halo=s.add.circle(869,488,34,0x99eec5,.24).setDepth(5);
  const puerta=s.add.rectangle(869,488,54,70,0xcfdad4,.9).setStrokeStyle(4,0x719b82,.75).setDepth(6);
  const simbolo=s.add.text(869,487,'🔒',{fontSize:'29px'}).setOrigin(.5).setDepth(7);
  meta={x:869,y:488,halo,puerta,simbolo,active:true,destroy(){halo.destroy();puerta.destroy();simbolo.destroy();this.active=false}};
  metaBrillo=halo;
}
function actualizarSalida(){
  if(!meta||!meta.active)return;
  const abierto=recogidas>=necesarias;
  meta.puerta.setFillStyle(abierto?0x78e7ac:0xd2becb,1);
  meta.puerta.setStrokeStyle(4,abierto?0x3cba76:0xa78c9e);
  meta.simbolo.setText(abierto?'💚':'🔒');
  meta.halo.setFillStyle(abierto?0xa7ffc8:0xffbad5,abierto?.34:.2);
}
function actualizarHUD(){
  const resumen=`Etapa ${capitulo}${modo==='historia'?'/5':''} · 💗 ${recogidas}/${necesarias} · ⏱ ${tiempoFmt(totalSegundos)} · 🚩 ${esquivadas}`;
  txtEstado.setText(resumen);
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil && statsMovil.textContent!==resumen)statsMovil.textContent=resumen;
  txtComodines.setText('🛟 Sami '+(comodas[0]?'✖':'✓')+'   Paul '+(comodas[1]?'✖':'✓')+'   Ali '+(comodas[2]?'✖':'✓'));
  for(let i=0;i<3;i++){
    const b=document.getElementById('helper'+i);
    if(b){b.classList.toggle('used',comodas[i]);b.disabled=comodas[i];}
  }
}
function setPersonajesVisibles(v){
  jugadora.setVisible(v).setActive(v);jugadora.body.enable=v;
  for(const ch of Object.values(chicos)){ch.setVisible(v).setActive(v);ch.body.enable=v;}
}
function prepararEtapa(s){
  window.resetearMovimientoTactil?.();
  limpiarPanel();liberarEscenario();
  const tema=CAPITULOS[(capitulo-1)%CAPITULOS.length];
  crearFondo(s,tema);
  crearJardin(s,capitulo);
  recogidas=0;etapaSegundos=0;txtAviso.setVisible(false);avisoHasta=0;
  necesarias=Math.min(3+capitulo,9);
  crearCorazones(s,necesarias);
  crearSalida(s);
  actualizarSalida();
  jugadora.setPosition(136,310).setVelocity(0).clearTint().setAlpha(1);
  const posiciones={Diego:[861,145],Alexander:[860,498],Nicolás:[510,139],Andy:[132,507]};
  for(const [nombre,ch] of Object.entries(chicos)){
    const [x,y]=posiciones[nombre];ch.setPosition(x,y).setVelocity(0).clearTint().setAlpha(1);
  }
  setPersonajesVisibles(true);
  pantallaHUD.setVisible(true);s.data.get('banda').setVisible(true);txtFrase.setVisible(true);
  congeladosHasta=0;inmuneHasta=s.time.now+1700;andyDisponibleEn=s.time.now+2000;ralentizadaHasta=0;
  banderaSiguiente=s.time.now+2300;fraseSiguiente=s.time.now+4700;
  txtFrase.setText('🌷 '+tema.titulo+' — '+tema.sub+'   ¡Consigue '+necesarias+' corazones para abrir la salida!');
  fraseHasta=s.time.now+5500;
  estado='jugando';actualizarHUD();
}
function nuevaPartida(s,eleccion){
  modo=eleccion;capitulo=1;vida=1;
  totalSegundos=0;esquivadas=0;comodas=[false,false,false];
  prepararEtapa(s);
}
function detenerMovimiento(){
  jugadora.setVelocity(0);
  Object.values(chicos).forEach(ch=>ch.setVelocity(0));
}
function limpiarPanel(){
  if(panel){panel.destroy(true);panel=null;}
  botonesPanel=[];
}
function boton(s,contenedor,x,y,ancho,alto,texto,accion,color=0xed78ae,letra='#ffffff'){
  const rec=s.add.rectangle(x,y,ancho,alto,color).setStrokeStyle(2,0xffffff,.9).setInteractive({useHandCursor:true});
  const lab=s.add.text(x,y,texto,{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:letra,align:'center',wordWrap:{width:ancho-14}}).setOrigin(.5);
  rec.on('pointerover',()=>rec.setScale(1.03));rec.on('pointerout',()=>rec.setScale(1));
  rec.on('pointerdown',accion);
  contenedor.add([rec,lab]);botonesPanel.push(rec);
}
function basePanel(s,titulo,subtitulo){
  limpiarPanel();
  panel=s.add.container(0,0).setDepth(100);
  const velo=s.add.rectangle(480,300,960,600,0x734b69,.48);
  const sombra=s.add.rectangle(484,304,817,485,0x986e92,.12);
  const base=s.add.rectangle(480,295,810,480,0xfffaff,.99).setStrokeStyle(5,0xf6a9d0);
  const escarapela=s.add.text(480,87,'🌸  ★  💌  ★  🌸',{fontSize:'20px'}).setOrigin(.5);
  const tituloTxt=s.add.text(480,142,titulo,{fontFamily:'Arial',fontSize:titulo.length>29?'31px':'38px',fontStyle:'bold',color:'#a53575',align:'center',wordWrap:{width:730}}).setOrigin(.5);
  const subtituloTxt=s.add.text(480,244,subtitulo,{fontFamily:'Arial',fontSize:'19px',color:'#80536f',align:'center',lineSpacing:9,wordWrap:{width:724}}).setOrigin(.5);
  panel.add([velo,sombra,base,escarapela,tituloTxt,subtituloTxt]);
  return panel;
}
function dibujarMenu(s){
  window.resetearMovimientoTactil?.();
  estado='menu';
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='💗 Elige HISTORIA o MODO INFINITO para comenzar';liberarEscenario();setPersonajesVisibles(false);
  pantallaHUD.setVisible(false);s.data.get('banda').setVisible(false);txtFrase.setVisible(false);txtAviso.setVisible(false);
  const tela=s.add.graphics().setDepth(-3);tela.fillStyle(0xfff0f8);tela.fillRect(0,0,960,600);
  for(let x=0;x<960;x+=58)for(let y=0;y<600;y+=58){tela.fillStyle(0xffd0e5,.23);tela.fillCircle(x,y,7);}
  elementos.push(tela);
  const p=basePanel(s,'¡HUYE, AMIGA, HUYE!','Una chica. Cuatro chicos. Tres amigas que te rescatan.\nDiego, Alexander y Nicolás persiguen; Andy te protege.\nRecoge corazones y alcanza la salida antes de que se acaben tus comodines.');
  ['Diego','Alexander','Nicolás','Andy'].forEach((n,i)=>{
    const x=280+i*135;
    const sprite=s.add.image(x,341,'personaje_'+n).setScale(1.17);
    const label=s.add.text(x,391,n,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:n==='Andy'?'#289b78':'#ab5077'}).setOrigin(.5);
    p.add([sprite,label]);
  });
  boton(s,p,278,460,225,48,'📖 HISTORIA · 5 ETAPAS',()=>nuevaPartida(s,'historia'));
  boton(s,p,523,460,225,48,'♾️ MODO INFINITO',()=>nuevaPartida(s,'infinito'),0x9e83cd);
  boton(s,p,765,460,210,48,'💬 300 FRASES',()=>dibujarGaleria(s),0x64bba0);
  const record=s.add.text(480,519,`🏆 Historias completadas: ${recordHistoria}  ·  Récord infinito: etapa ${recordInfinito}`,{fontFamily:'Arial',fontSize:'15px',color:'#ad7993'}).setOrigin(.5);
  p.add(record);
}
function dibujarGaleria(s){
  window.resetearMovimientoTactil?.();
  estado='galeria';
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='💬 Descubre las 300 frases del juego';
  const p=basePanel(s,'EL LIBRO DE LAS FRASES','300 frases diferentes, sin repetir hasta agotar cada personaje.');
  for(const [i,n] of [...VILLANOS,'Andy'].entries()){
    boton(s,p,210+i*177,286,160,46,n,()=>{libroNombre=n;actualizarGaleria();},n==='Andy'?0x65bd9e:0xcda3d2);
  }
  const cita=s.add.text(480,356,'',{fontFamily:'Arial',fontSize:'26px',color:'#a23d71',align:'center',wordWrap:{width:675},lineSpacing:8}).setOrigin(.5);
  cita.setData('tipo','cita');p.add(cita);
  function actualizarGaleria(){cita.setText('«'+sacarFrase(libroNombre)+'»');}
  boton(s,p,364,475,250,52,'OTRA FRASE ✨',actualizarGaleria);
  boton(s,p,642,475,230,52,'VOLVER AL MENÚ',()=>dibujarMenu(s),0x9f86cc);
  actualizarGaleria();
}
function aviso(s,mensaje,color='#a23473',duracion=3100){
  txtAviso.setText(mensaje).setColor(color).setVisible(true);
  avisoHasta=s.time.now+duracion;
}
function fraseAlPaso(s,nombre,txt,duracion=4500){
  txtFrase.setText((nombre==='Andy'?'💚 ':'💬 ')+nombre+': «'+txt+'»');
  fraseHasta=s.time.now+duracion;
}
function crearBandera(s,t){
  if(banderas.length>=13)return;
  const borde=Phaser.Math.Between(0,3);
  const x=borde===0?36:borde===1?924:Phaser.Math.Between(52,908);
  const y=borde===2?108:borde===3?543:Phaser.Math.Between(128,532);
  const dx=jugadora.x-x,dy=jugadora.y-y;
  const d=Math.hypot(dx,dy)||1;
  const v=Math.min(175,105+capitulo*7);
  const rojo=s.add.text(x,y,'🚩',{fontSize:'27px'}).setOrigin(.5).setDepth(15);
  banderas.push({obj:rojo,vx:(dx/d)*v,vy:(dy/d)*v,nacio:t});
}
function lanzarComodin(s,index,culpable,t){
  if(estado!=='jugando'||index<0||index>2||comodas[index])return false;
  comodas[index]=true;
  const nombre=AMIGAS[index];
  // Buscar el punto seguro más lejano del perseguidor cercano.
  const puntos=[[137,190],[140,485],[465,515],[850,505],[830,170],[510,300]];
  let mejor=puntos[0],distanciaMax=-1;
  for(const p of puntos){
    const menor=Math.min(...VILLANOS.map(v=>Math.hypot(p[0]-chicos[v].x,p[1]-chicos[v].y)));
    if(menor>distanciaMax){distanciaMax=menor;mejor=p;}
  }
  jugadora.setPosition(mejor[0],mejor[1]).setVelocity(0);
  inmuneHasta=t+3200;congeladosHasta=Math.max(congeladosHasta,t+2600);
  ralentizadaHasta=0;
  s.cameras.main.flash(180,255,238,250);
  aviso(s,`🛟 ¡${nombre} te salvó de ${culpable}! ¡Amiga al rescate!`,'#a43e81',3500);
  fraseAlPaso(s,culpable,sacarFrase(culpable),3300);
  actualizarHUD();
  return true;
}
function activarComodin(s,index,automatico,t){
  if(estado!=='jugando'||comodas[index])return false;
  const cercano=VILLANOS.map(v=>({nombre:v,dist:Phaser.Math.Distance.Between(chicos[v].x,chicos[v].y,jugadora.x,jugadora.y)})).sort((a,b)=>a.dist-b.dist)[0];
  if(!automatico&&cercano.dist>175){aviso(s,'💬 Guarda el comodín: todavía no hay peligro cerca.');return false;}
  return lanzarComodin(s,index,cercano.nombre,t);
}
function contactoVillano(s,perseguidor,t){
  if(t<inmuneHasta)return;
  const primero=comodas.findIndex(v=>!v);
  if(primero!==-1){lanzarComodin(s,primero,perseguidor,t);return;}
  terminar(s,perseguidor);
}
function contactoAndy(s,t){
  if(t<andyDisponibleEn)return;
  congeladosHasta=Math.max(congeladosHasta,t+7000);
  andyDisponibleEn=t+15000;
  chicos.Andy.setPosition(129,518).setVelocity(0);
  aviso(s,'💚 Andy llegó: ¡7 segundos de paz! Los otros quedaron congelados.','#268a6a',3400);
  fraseAlPaso(s,'Andy',sacarFrase('Andy'),4700);
  actualizarHUD();
}
function terminar(s,nombre){
  window.resetearMovimientoTactil?.();
  estado='perdio';
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='💔 Te atraparon · ¡Vuelve a intentarlo!';detenerMovimiento();
  if(modo==='infinito'&&capitulo>recordInfinito){recordInfinito=capitulo;try{localStorage.setItem('huye_infinito_etapas',String(recordInfinito))}catch(e){}}
  const cita=sacarFrase(nombre);
  const p=basePanel(s,'💔 TE ATRAPÓ '+nombre.toUpperCase(),`«${cita}»\n\n⏱ ${tiempoFmt(totalSegundos)}   🚩 ${esquivadas} esquivadas   🌷 Etapa ${capitulo}\nTus tres comodines se agotaron. ¡Una sola vida!`);
  boton(s,p,356,476,270,56,'REINTENTAR 💗',()=>nuevaPartida(s,modo));
  boton(s,p,640,476,245,56,'MENÚ PRINCIPAL',()=>dibujarMenu(s),0x9f86cc);
}
function etapaSuperada(s){
  window.resetearMovimientoTactil?.();
  estado='etapa';
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='✨ ¡Etapa superada! Toca SIGUIENTE ETAPA';detenerMovimiento();
  if(modo==='historia'&&capitulo>=CAPITULOS.length){
    estado='victoria';recordHistoria++;try{localStorage.setItem('huye_historia_tiempo',String(recordHistoria))}catch(e){}
    const p=basePanel(s,'🏆 ¡GANASTE, AMIGA!','Superaste los 5 capítulos y escapaste de las red flags.\n\n⏱ Tiempo total: '+tiempoFmt(totalSegundos)+'   🚩 Esquivadas: '+esquivadas+'\n🛟 Amigas disponibles: '+comodas.filter(v=>!v).length+' de 3\n💚 Tu paz fue el verdadero premio.');
    boton(s,p,348,476,280,56,'VOLVER A JUGAR',()=>nuevaPartida(s,'historia'));
    boton(s,p,649,476,275,56,'MENÚ PRINCIPAL',()=>dibujarMenu(s),0x72bda3);
    return;
  }
  const lista=CAPITULOS;
  const titulo=lista[(capitulo-1)%lista.length].titulo;
  const p=basePanel(s,'✨ ¡ETAPA SUPERADA!','Conseguiste todos los corazones y llegaste a la salida.\n\n🌸 '+titulo+'\n⏱ Tiempo acumulado: '+tiempoFmt(totalSegundos)+'   🚩 '+esquivadas+' esquivadas\n🛟 Te quedan '+comodas.filter(v=>!v).length+' comodines para las próximas etapas.');
  boton(s,p,352,475,288,58,'SIGUIENTE ETAPA →',()=>{capitulo++;prepararEtapa(s)});
  boton(s,p,655,475,230,58,'MENÚ PRINCIPAL',()=>dibujarMenu(s),0x9f86cc);
}

function update(t,delta){
  if(estado!=='jugando')return;
  const segundos=Math.min(delta,70)/1000;
  totalSegundos+=segundos;etapaSegundos+=segundos;
  const tactil=window.CONTROL_TACTIL||{};
  const stick=window.CONTROL_JOYSTICK||{x:0,y:0};
  const ix=Number(controles.right.isDown||teclasExtra.D.isDown||tactil.right)-Number(controles.left.isDown||teclasExtra.A.isDown||tactil.left)+stick.x;
  const iy=Number(controles.down.isDown||teclasExtra.S.isDown||tactil.down)-Number(controles.up.isDown||teclasExtra.W.isDown||tactil.up)+stick.y;
  const modulo=Math.hypot(ix,iy)||1;
  const velocidad=t<ralentizadaHasta?145:235;
  jugadora.setVelocity(ix/modulo*velocidad,iy/modulo*velocidad);
  jugadora.setAlpha(t<inmuneHasta?(.65+.35*Math.abs(Math.sin(t/150))):1);

  if(Phaser.Input.Keyboard.JustDown(teclasExtra.ONE))activarComodin(this,0,false,t);
  if(Phaser.Input.Keyboard.JustDown(teclasExtra.TWO))activarComodin(this,1,false,t);
  if(Phaser.Input.Keyboard.JustDown(teclasExtra.THREE))activarComodin(this,2,false,t);

  // Las tres red flags persiguen juntas. Los jardines no bloquean sus fantasmas.
  const estanCongelados=t<congeladosHasta;
  for(const [i,nombre] of VILLANOS.entries()){
    const ch=chicos[nombre];
    if(estanCongelados){ch.setVelocity(0).setTint(0x9bd7ff);continue;}
    ch.clearTint();
    const dx=jugadora.x-ch.x,dy=jugadora.y-ch.y,d=Math.hypot(dx,dy)||1;
    const v=Math.min(201,79+i*5+capitulo*11+Math.min(18,etapaSegundos*.22));
    ch.setVelocity(dx/d*v,dy/d*v);
    if(d<33)contactoVillano(this,nombre,t);
    if(estado!=='jugando')return;
  }
  // Andy se acerca para activar un congelamiento de 7 segundos; jamás causa derrota.
  const a=chicos.Andy,dx=jugadora.x-a.x,dy=jugadora.y-a.y,d=Math.hypot(dx,dy)||1;
  a.setVelocity(dx/d*Math.min(158,109+capitulo*8),dy/d*Math.min(158,109+capitulo*8));
  if(d<38)contactoAndy(this,t);

  // Corazones por etapa y salida (victoria al completar 5 en modo Historia).
  for(const f of flores){
    if(!f.tomada&&Phaser.Math.Distance.Between(jugadora.x,jugadora.y,f.x,f.y)<31){
      f.tomada=true;recogidas++;f.aro.destroy();f.icono.destroy();
      actualizarSalida();
      if(recogidas===necesarias)aviso(this,'💚 ¡Salida desbloqueada! Corre hacia la puerta verde.','#2b9872',3300);
    }
  }
  if(recogidas>=necesarias&&Math.hypot(jugadora.x-meta.x,jugadora.y-meta.y)<43){etapaSuperada(this);return;}

  // Banderitas que atraviesan el campo: esquivar suma al marcador.
  if(t>=banderaSiguiente){crearBandera(this,t);banderaSiguiente=t+Math.max(1050,2550-capitulo*140);}
  for(let i=banderas.length-1;i>=0;i--){
    const b=banderas[i];b.obj.x+=b.vx*segundos;b.obj.y+=b.vy*segundos;
    const toca=Math.hypot(jugadora.x-b.obj.x,jugadora.y-b.obj.y)<29;
    const sale=b.obj.x<22||b.obj.x>938||b.obj.y<94||b.obj.y>556;
    // Pequeño límite de vida: evita que se queden dando vueltas sin fin.
    const expira=t-b.nacio>10500;
    if(toca||sale||expira){
      if(toca){if(t>=inmuneHasta)ralentizadaHasta=t+1100;}
      else esquivadas++;
      b.obj.destroy();banderas.splice(i,1);
    }
  }
  if(t>=fraseSiguiente){const nombre=alAzar([...VILLANOS,'Andy']);fraseAlPaso(this,nombre,sacarFrase(nombre));fraseSiguiente=t+Phaser.Math.Between(6600,9200);}
  if(t>=fraseHasta)txtFrase.setText('🏃 Esquiva las 🚩  ·  💗 Reúne corazones  ·  🛟 Cuida tus 3 comodines  ·  💚 Busca a Andy');
  if(t>=avisoHasta)txtAviso.setVisible(false);
  actualizarHUD();
}
