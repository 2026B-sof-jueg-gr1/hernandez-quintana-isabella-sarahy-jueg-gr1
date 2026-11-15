/* ¡HUYE, AMIGA, HUYE! - Edición capítulos
   Proyecto sencillo: Phaser 3 + JavaScript + HTML/CSS.
   Sin framework adicional, sin backend y sin base de datos.
*/
'use strict';

const W=960, H=600;
const VILLANOS=['Alexander','Nicolás'];
const PERSONAJES=['Martín',...VILLANOS];
const PROBABILIDAD_AYUDA_MARTIN=0.5;
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
let elementos=[],flores=[],banderas=[],meta,panel=null,pantallaHUD,txtEstado,txtComodines,txtFrase,txtAviso;
let recogidas=0,necesarias=4,esquivadas=0,totalSegundos=0,etapaSegundos=0;
let congeladosHasta=0,inmuneHasta=0,ralentizadaHasta=0,banderaSiguiente=0,fraseSiguiente=0,avisoHasta=0,fraseHasta=0;
let colaFrases={},libroNombre='Martín';
let martinDisponibleEn=0,rutaMartin=0;
const RUTA_MARTIN=[[115,160],[840,160],[840,490],[115,490]];
const INTRO=[
  {titulo:'La noche en que elegiste tu paz',texto:'La fiesta de la universidad terminó, pero el drama apenas comienza. Quieres volver a casa y dejar atrás las excusas. Reúne los corazones de cada jardín para abrir la salida: Alexander y Nicolás no aceptan que hayas puesto límites.',personaje:'chica'},
  {titulo:'Alexander · El orgullo herido',texto:'Sus cumplidos siempre venían con una crítica. Cuando dejaste de buscar su aprobación, lo tomó como una ofensa. Ahora te persigue para tener la última palabra y convencerte de que el problema eres tú. No te detengas a discutir.',personaje:'Alexander'},
  {titulo:'Nicolás · Las promesas pendientes',texto:'Prometía claridad, pero desaparecía cuando tocaba hablar en serio. Le dijiste que no esperarías más y ahora corre detrás de ti pidiendo otra oportunidad, sin cambiar nada. Sus excusas no tienen por qué cerrar tu camino.',personaje:'Nicolás'},
  {titulo:'Martín · Delivery de sorpresas',texto:'Martín recorre el jardín en su moto, con mochila de delivery. No toma partido: al acercarte, hay un 50 % de ayuda y un 50 % de lío. Puede llevarte lejos del peligro… o mostrarte una foto besando a una chica, o cobrarte la salchicha que te prestó y hacerte perder tiempo.',personaje:'Martín'},
  {titulo:'Sami · Un plan de rescate',texto:'Sami vio cómo te agotaban las mismas excusas. Preparó una ruta para sacarte del apuro: pulsa 1 o su botón cuando un perseguidor esté cerca. Su rescate te lleva a un lugar seguro y te protege unos segundos. Solo puede hacerlo una vez por partida.'},
  {titulo:'Paul · Siempre a tu lado',texto:'Paul te recordó que no debes explicaciones por querer irte. Si el peligro se acerca, pulsa 2 o su botón: te ayudará a tomar distancia. Como Sami, tiene un único rescate y también lo usará automáticamente si te atrapan.'},
  {titulo:'Ali · La última llamada',texto:'Ali prometió que no volverías sola. Pulsa 3 o su botón cuando necesites su rescate. Entre las tres te darán tres oportunidades; después, un encuentro con Alexander o Nicolás termina la partida. Decide si arriesgarte con Martín y llega a la salida.'}
];

let citaElegida=null;
let protagonista=Personalizacion.cargar();

let recordHistoria=0,recordInfinito=0;
let botonesPanel=[];
try{recordHistoria=Number(localStorage.getItem('huye_historia_tiempo')||0);recordInfinito=Number(localStorage.getItem('huye_infinito_etapas')||0);}catch(e){}

// NONE mantiene fijo el tamaño interno del canvas. Solo CSS adapta el elemento a la pantalla.
// Esto elimina el zoom progresivo que producía la combinación FIT + redimensionado CSS.
const configuracion={type:Phaser.AUTO,width:W,height:H,parent:'game',backgroundColor:'#fff1f8',
  physics:{default:'arcade',arcade:{debug:false}},
  scale:{mode:Phaser.Scale.NONE},pixelArt:true,roundPixels:true,
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

function create(){
  escena=this;
  this.cameras.main.setBackgroundColor('#fff4f9');
  this.physics.world.setBounds(20,100,920,450);
  SpritesJuego.crearTexturas(this);
  SpritesJuego.configurarProta(this,protagonista);
  arbustos=this.physics.add.staticGroup();
  jugadora=this.physics.add.sprite(136,310,SpritesJuego.claveProta).setDepth(13).setCollideWorldBounds(true);
  jugadora.body.setSize(32,32).setOffset(11,24);
  jugadora.setVisible(false).setActive(false).body.enable=false;
  const puntos={Martín:[861,148],Alexander:[870,486],Nicolás:[470,145]};
  for(const nombre of PERSONAJES){
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
  this.data.set('banda',banda);this.data.set('marca',marca);
  dibujarPersonalizacion(this);
  window.usarComodin=(n)=>activarComodin(this,n,false,this.time.now);
  window.huyeEstaJugando=()=>estado==='jugando';
}

function liberarEscenario(){
  elementos.forEach(obj=>{if(obj&&obj.active)obj.destroy()});elementos=[];
  flores.forEach(o=>{if(o.aro?.active)o.aro.destroy();if(o.icono?.active)o.icono.destroy()});flores=[];
  banderas.forEach(b=>{if(b.obj&&b.obj.active)b.obj.destroy()});banderas=[];
  if(meta&&meta.active)meta.destroy();meta=null;
  arbustos.clear(true,true);
}
function crearFondo(s,tema){
  elementos.push(SpritesJuego.fondo(s,tema));
}
function crearJardin(s,cap){
  const c=CAPITULOS[(cap-1)%CAPITULOS.length];
  const posiciones=[
    [280,246,122,26],[645,257,130,28],[395,429,128,28],[737,425,110,27],
    [310,371,95,24],[600,371,112,28],[456,203,90,24]
  ];
  const cantidad=Math.min(4+Math.floor((cap-1)/2),7);
  for(const [cx,cy,w,h] of posiciones.slice(0,cantidad)){
    const arte=SpritesJuego.jardinera(s,cx,cy,w,h,c.planta);
    elementos.push(arte.dibujo);
    arbustos.add(arte.cuerpo);
    arte.cuerpo.body.updateFromGameObject();
  }
}
function crearCorazones(s,cant){
  const sitios=mezclar(RECOGIDAS.filter(([x,y])=>Math.hypot(x-136,y-310)>90 && Math.hypot(x-864,y-485)>75));
  for(const [x,y] of sitios.slice(0,cant)){
    flores.push(SpritesJuego.corazon(s,x,y));
  }
}
function crearSalida(s){
  meta=SpritesJuego.salida(s,869,488);
}
function actualizarSalida(){
  if(meta&&meta.active)SpritesJuego.actualizarSalida(meta,recogidas>=necesarias);
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
  martinDisponibleEn=s.time.now+2500;rutaMartin=1;
  necesarias=Math.min(3+capitulo,9);
  crearCorazones(s,necesarias);
  crearSalida(s);
  actualizarSalida();
  jugadora.setPosition(136,310).setVelocity(0).clearTint().setAlpha(1);
  const posiciones={Martín:[861,145],Alexander:[860,498],Nicolás:[510,139]};
  for(const [nombre,ch] of Object.entries(chicos)){
    const [x,y]=posiciones[nombre];ch.setPosition(x,y).setVelocity(0).clearTint().setAlpha(1);
  }
  setPersonajesVisibles(true);
  pantallaHUD.setVisible(true);s.data.get('banda').setVisible(true);txtFrase.setVisible(true);
  congeladosHasta=0;inmuneHasta=s.time.now+1700;ralentizadaHasta=0;
  banderaSiguiente=s.time.now+2300;fraseSiguiente=s.time.now+4700;
  txtFrase.setText('🌷 '+tema.titulo+' — '+tema.sub+'   ¡Consigue '+necesarias+' corazones para abrir la salida!');
  fraseHasta=s.time.now+5500;
  estado='jugando';actualizarHUD();
}
function dibujarPersonalizacion(s){
  pausarParaRelato(s,'personalizando');limpiarPanel();
  estadoMovil('Crea a tu protagonista · Elige tu nombre y tu look');
  Personalizacion.mostrar(s,protagonista,elegida=>{
    protagonista=elegida;
    jugadora.setTexture(SpritesJuego.configurarProta(s,elegida));
    jugadora.body.setSize(32,32).setOffset(11,24);
    s.data.get('marca').setText('💗 '+elegida.nombre.toUpperCase());
    dibujarMenu(s);
  });
}
function nuevaPartida(s,eleccion){
  modo=eleccion;capitulo=1;vida=1;
  totalSegundos=0;esquivadas=0;comodas=[false,false,false];
  citaElegida=null;
  dibujarEleccion(s);
}
function pausarParaRelato(s,nuevoEstado){
  estado=nuevoEstado;detenerMovimiento();setPersonajesVisibles(false);
  pantallaHUD.setVisible(false);s.data.get('banda').setVisible(false);
  txtFrase.setVisible(false);txtAviso.setVisible(false);
  window.resetearMovimientoTactil?.();
}
function estadoMovil(texto){
  const stats=document.getElementById('mobile-status');
  if(stats)stats.textContent=texto;
}
function dibujarEleccion(s){
  pausarParaRelato(s,'eleccion');
  estadoMovil('Antes de aquella noche · Elige con quién querías salir');
  const p=basePanel(s,'ANTES DE AQUELLA NOCHE','¿Con quién quieres salir?\nLas historias de Alex, Nico y Martín están por venir.');
  const candidatos=[['Alex','Alexander'],['Nico','Nicolás'],['Martín','Martín']];
  candidatos.forEach(([nombre,personaje],i)=>{
    const x=300+i*180;
    p.add(s.add.image(x,346,'personaje_'+personaje).setScale(1.25));
    boton(s,p,x,421,162,52,nombre,()=>{
      citaElegida=personaje;
      dibujarRutaPendiente(s,nombre);
    },0xb28ac7);
  });
  boton(s,p,480,497,235,40,'VOLVER AL MENÚ',()=>dibujarMenu(s),0x9f86cc);
}
function dibujarRutaPendiente(s,nombre){
  pausarParaRelato(s,'rutaPendiente');
  estadoMovil('Elegiste a '+nombre+' · Historia pendiente');
  const p=basePanel(s,'ELEGISTE A '+nombre.toUpperCase(),'Su historia todavía está por escribirse.\nPuedes continuar a la introducción del juego\no volver para elegir otro personaje.');
  p.add(s.add.image(480,364,'personaje_'+citaElegida).setScale(1.4));
  boton(s,p,310,476,280,52,'CAMBIAR ELECCIÓN',()=>dibujarEleccion(s),0x9f86cc);
  boton(s,p,650,476,280,52,'IR A LA INTRODUCCIÓN',()=>dibujarIntro(s,0));
}
function dibujarIntro(s,paso){
  estado='intro';detenerMovimiento();setPersonajesVisibles(false);
  pantallaHUD.setVisible(false);s.data.get('banda').setVisible(false);
  txtFrase.setVisible(false);txtAviso.setVisible(false);
  window.resetearMovimientoTactil?.();
  const historia=paso===0?{...INTRO[0],titulo:protagonista.nombre+' · Tu paz primero'}:INTRO[paso];
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='📖 '+(paso+1)+'/'+INTRO.length+' · '+historia.titulo;
  const p=basePanel(s,historia.titulo,historia.texto);
  if(historia.personaje){
    p.add(s.add.image(480,378,historia.personaje==='chica'?SpritesJuego.claveProta:'personaje_'+historia.personaje).setScale(1.25));
  }else{
    p.add(s.add.text(480,375,'🛟 '+AMIGAS[paso-4],{fontFamily:'Arial',fontSize:'30px',color:'#a53575'}).setOrigin(.5));
  }
  p.add(s.add.text(480,425,(paso+1)+' / '+INTRO.length,{fontFamily:'Arial',fontSize:'15px',color:'#80536f'}).setOrigin(.5));
  if(paso===0)boton(s,p,240,480,170,48,'← ELECCIÓN',()=>dibujarEleccion(s),0x9f86cc);
  if(paso>0)boton(s,p,240,480,170,48,'← ANTERIOR',()=>dibujarIntro(s,paso-1),0x9f86cc);
  boton(s,p,480,480,260,48,paso===INTRO.length-1?'¡A JUGAR!':'SIGUIENTE →',()=>paso===INTRO.length-1?prepararEtapa(s):dibujarIntro(s,paso+1));
  boton(s,p,730,480,200,48,'SALTAR INTRO',()=>prepararEtapa(s),0x64bba0);
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
function basePanel(s,titulo,subtitulo,lectura=false){
  limpiarPanel();
  panel=s.add.container(0,0).setDepth(100);
  const velo=s.add.rectangle(480,300,960,600,0x734b69,.48);
  const sombra=s.add.rectangle(484,304,817,485,0x986e92,.12);
  const base=s.add.rectangle(480,295,810,480,0xfffaff,.99).setStrokeStyle(5,0xf6a9d0);
  const escarapela=s.add.text(480,87,'🌸  ★  💌  ★  🌸',{fontSize:'20px'}).setOrigin(.5);
  const tituloTxt=s.add.text(480,142,titulo,{fontFamily:'Arial',fontSize:titulo.length>29?'31px':'38px',fontStyle:'bold',color:'#a53575',align:'center',wordWrap:{width:730}}).setOrigin(.5);
  const subtituloTxt=s.add.text(480,lectura?285:244,subtitulo,{fontFamily:'Arial',fontSize:'19px',color:'#80536f',align:'center',lineSpacing:9,wordWrap:{width:724}}).setOrigin(.5);
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
  const p=basePanel(s,'¡HUYE, AMIGA, HUYE!','Alexander y Nicolás te persiguen.\nMartín reparte sorpresas en moto: 50 % ayuda, 50 % lío.\nConoce la historia, reúne corazones y escapa con tus amigas.');
  PERSONAJES.forEach((n,i)=>{
    const x=345+i*135;
    const sprite=s.add.image(x,341,'personaje_'+n).setScale(1.17);
    const label=s.add.text(x,391,n,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#ab5077'}).setOrigin(.5);
    p.add([sprite,label]);
  });
  boton(s,p,278,460,225,48,'📖 HISTORIA · 5 ETAPAS',()=>nuevaPartida(s,'historia'));
  boton(s,p,523,460,225,48,'♾️ MODO INFINITO',()=>nuevaPartida(s,'infinito'),0x9e83cd);
  boton(s,p,765,460,210,48,'💬 LIBRO DE FRASES',()=>dibujarGaleria(s),0x64bba0);
  boton(s,p,480,410,420,32,'✦ '+protagonista.nombre+' · PERSONALIZAR',()=>dibujarPersonalizacion(s),0xb4819e);
  const record=s.add.text(480,519,`🏆 Historias completadas: ${recordHistoria}  ·  Récord infinito: etapa ${recordInfinito}`,{fontFamily:'Arial',fontSize:'15px',color:'#ad7993'}).setOrigin(.5);
  p.add(record);
}
function dibujarGaleria(s){
  window.resetearMovimientoTactil?.();
  estado='galeria';
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='💬 Descubre las frases de los personajes';
  const p=basePanel(s,'EL LIBRO DE LAS FRASES','Diálogos de cada personaje, sin repetir hasta agotar su colección.');
  for(const [i,n] of PERSONAJES.entries()){
    boton(s,p,303+i*177,286,160,46,n,()=>{libroNombre=n;actualizarGaleria();},0xcda3d2);
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
  txtFrase.setText('💬 '+nombre+': «'+txt+'»');
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
  const rojo=SpritesJuego.bandera(s,x,y);
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
function puntoSeguro(){
  const candidatos=RECOGIDAS.filter(([x,y])=>!arbustos.getChildren().some(o=>{
    const r=o.getBounds();return x>r.left-24&&x<r.right+24&&y>r.top-28&&y<r.bottom+28;
  }));
  const distancia=p=>Math.min(...VILLANOS.map(n=>Math.hypot(p[0]-chicos[n].x,p[1]-chicos[n].y)));
  return candidatos.reduce((mejor,p)=>distancia(p)>distancia(mejor)?p:mejor,candidatos[0]||[136,310]);
}
function mostrarFotoMartin(s){
  const foto=SpritesJuego.foto(s,790,210);
  elementos.push(foto);
  s.time.delayedCall(3200,()=>{if(foto.active)foto.destroy();});
}
function contactoMartin(s,t){
  if(t<martinDisponibleEn)return;
  martinDisponibleEn=t+12000;
  if(Math.random()<PROBABILIDAD_AYUDA_MARTIN){
    const [x,y]=puntoSeguro();
    jugadora.setPosition(x,y).setVelocity(0);
    inmuneHasta=Math.max(inmuneHasta,t+3200);ralentizadaHasta=0;
    s.cameras.main.flash(180,220,255,242);
    aviso(s,'🛵 Martín: ¡delivery de rescate! Te llevó lejos del peligro.','#268a6a',4200);
    fraseAlPaso(s,'Martín','¡Súbete! Esta entrega va a un lugar seguro.');
  }else if(Math.random()<0.5){
    mostrarFotoMartin(s);
    ralentizadaHasta=Math.max(ralentizadaHasta,t+2800);
    aviso(s,'📸 Martín te muestra una foto besándose con una chica. ¡El drama te ralentiza!','#a23473',4200);
    fraseAlPaso(s,'Martín','Era una foto… bueno, sí, nos estábamos besando.');
  }else{
    ralentizadaHasta=Math.max(ralentizadaHasta,t+3500);
    aviso(s,'🌭 Martín te cobra la salchicha que te prestó. ¡Pierdes tiempo y vas más lento!','#a23473',4200);
    fraseAlPaso(s,'Martín','Oye, ¿y lo de la salchicha que te presté?');
  }
}
function moverMartin(s,t){
  const m=chicos['Martín'],destino=RUTA_MARTIN[rutaMartin];
  const dx=destino[0]-m.x,dy=destino[1]-m.y,d=Math.hypot(dx,dy)||1;
  if(d<18)rutaMartin=(rutaMartin+1)%RUTA_MARTIN.length;
  m.setVelocity(dx/d*155,dy/d*155);
  m.setFlipX(dx<0).setAlpha(t<martinDisponibleEn?0.6:1);
  if(Math.hypot(jugadora.x-m.x,jugadora.y-m.y)<44)contactoMartin(s,t);
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
    const p=basePanel(s,'🏆 ¡GANASTE, '+protagonista.nombre.toUpperCase()+'!','Superaste los 5 capítulos y escapaste de las red flags.\n\n⏱ Tiempo total: '+tiempoFmt(totalSegundos)+'   🚩 Esquivadas: '+esquivadas+'\n🛟 Amigas disponibles: '+comodas.filter(v=>!v).length+' de 3\n💚 Tu paz fue el verdadero premio.');
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


  // Alexander y Nicolás persiguen juntos. Los jardines no bloquean sus fantasmas.
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
  moverMartin(this,t);

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
  if(t>=fraseSiguiente){const nombre=alAzar(PERSONAJES);fraseAlPaso(this,nombre,sacarFrase(nombre));fraseSiguiente=t+Phaser.Math.Between(6600,9200);}
  if(t>=fraseHasta)txtFrase.setText('🏃 Esquiva las 🚩  ·  💗 Reúne corazones  ·  🛟 Cuida tus 3 comodines  ·  🛵 Martín: 50/50');
  if(t>=avisoHasta)txtAviso.setVisible(false);
  actualizarHUD();
}
