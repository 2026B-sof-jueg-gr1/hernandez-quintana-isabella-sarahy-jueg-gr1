/* ¡HUYE, AMIGA, HUYE! - Edición capítulos
   Proyecto sencillo: Phaser 3 + JavaScript + HTML/CSS.
   Sin framework adicional, sin backend y sin base de datos.
*/
'use strict';

const W=960, H=600;
const VILLANOS=['Alexander','Nicolás'];
const PERSONAJES=['Martín',...VILLANOS,'Andy'];
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
let elementos=[],flores=[],banderas=[],meta,metaBrillo,panel=null,pantallaHUD,txtEstado,txtComodines,txtFrase,txtAviso;
let recogidas=0,necesarias=4,esquivadas=0,totalSegundos=0,etapaSegundos=0;
let congeladosHasta=0,inmuneHasta=0,andyDisponibleEn=0,ralentizadaHasta=0,banderaSiguiente=0,fraseSiguiente=0,avisoHasta=0,fraseHasta=0;
let colaFrases={},libroNombre='Martín';
let martinDisponibleEn=0,rutaMartin=0,objetivoAndy=null;
const RUTA_MARTIN=[[115,160],[840,160],[840,490],[115,490]];
const INTRO=[
  {titulo:'La noche en que elegiste tu paz',texto:'La fiesta de la universidad terminó, pero el drama apenas comienza. Quieres volver a casa y dejar atrás las excusas. Reúne los corazones de cada jardín para abrir la salida: Alexander y Nicolás no aceptan que hayas puesto límites.',personaje:'chica'},
  {titulo:'Alexander · El orgullo herido',texto:'Sus cumplidos siempre venían con una crítica. Cuando dejaste de buscar su aprobación, lo tomó como una ofensa. Ahora te persigue para tener la última palabra y convencerte de que el problema eres tú. No te detengas a discutir.',personaje:'Alexander'},
  {titulo:'Nicolás · Las promesas pendientes',texto:'Prometía claridad, pero desaparecía cuando tocaba hablar en serio. Le dijiste que no esperarías más y ahora corre detrás de ti pidiendo otra oportunidad, sin cambiar nada. Sus excusas no tienen por qué cerrar tu camino.',personaje:'Nicolás'},
  {titulo:'Martín · Delivery de sorpresas',texto:'Martín recorre el jardín en su moto, con mochila de delivery. No toma partido: al acercarte, hay un 50 % de ayuda y un 50 % de lío. Puede llevarte lejos del peligro… o mostrarte una foto besando a una chica, o cobrarte la salchicha que te prestó y hacerte perder tiempo.',personaje:'Martín'},
  {titulo:'Andy · Tendrás que encontrarlo',texto:'Andy no es un villano. Evita el drama y sale corriendo cuando te acercas. Si quieres su ayuda, tendrás que buscarlo y alcanzarlo: congelará a los perseguidores durante 7 segundos. Después necesitará descansar antes de poder ayudarte otra vez.',personaje:'Andy'},
  {titulo:'Sami · Un plan de rescate',texto:'Sami vio cómo te agotaban las mismas excusas. Preparó una ruta para sacarte del apuro: pulsa 1 o su botón cuando un perseguidor esté cerca. Su rescate te lleva a un lugar seguro y te protege unos segundos. Solo puede hacerlo una vez por partida.'},
  {titulo:'Paul · Siempre a tu lado',texto:'Paul te recordó que no debes explicaciones por querer irte. Si el peligro se acerca, pulsa 2 o su botón: te ayudará a tomar distancia. Como Sami, tiene un único rescate y también lo usará automáticamente si te atrapan.'},
  {titulo:'Ali · La última llamada',texto:'Ali prometió que no volverías sola. Pulsa 3 o su botón cuando necesites su rescate. Entre las tres te darán tres oportunidades; después, un encuentro con Alexander o Nicolás termina la partida. Busca a Andy, decide si arriesgarte con Martín y llega a la salida.'}
];

// Ruta de Andy: primer trabajo técnico y una oportunidad que nunca llega.
let citaElegida=null, escenaAndy='inicio', recuerdosAndy=[], cierreAndy=null;
let nivelSecretoAndy=false;
const HISTORIA_ANDY={
inicio:{lugar:'PRIMER DÍA · TU PRIMER TRABAJO TÉCNICO',titulo:'No querías equivocarte',texto:'Entraste con miedo de que se notara todo lo que todavía no sabías. Revisaste dos veces tu ropa, tres veces la hora y demasiadas veces la dirección. Andy era tu superior. Te explicó el trabajo mientras tú intentabas recordar cada instrucción sin parecer perdida. No te cayó bien. Había algo en su manera de corregirte que te hacía sentir pequeña, aunque después descubrieras que el miedo también estaba hablando por ti. Aquel día solo deseaste aprender rápido y sobrevivir a la semana.',siguiente:'roces'},
roces:{lugar:'LAS PRIMERAS SEMANAS · OFICINA',titulo:'El man que te caía mal',texto:'Te molestaban sus comentarios, su seguridad, esa facilidad para hacer una broma cuando tú estabas al borde de bloquearte. Volvías a casa repasando lo que habías hecho mal y lo que él había dicho. Si alguien te hubiera preguntado por Andy, habrías puesto los ojos en blanco. No había una historia romántica escondida en esas primeras semanas. Había trabajo, nervios y un superior con el que todavía no sabías cómo tratar.',siguiente:'detalles'},
detalles:{lugar:'UN DÍA CUALQUIERA · ENTRE PENDIENTES',titulo:'Empezaste a notar demasiado',texto:'No supiste cuándo cambió. Un día reconociste su perfume antes de verlo entrar. Otro, te descubriste mirando cómo combinaba la ropa. Lo que antes te parecía presumido empezó a parecerte lindo. Seguía siendo Andy, haciendo las mismas cosas, pero tus ojos ya no estaban de tu lado. Y luego estaba su risa: te hacía reír incluso cuando te proponías estar seria. A veces alargabas una conversación solo por escucharlo reír otra vez.',opciones:[{texto:'Quedarte pensando en su perfume',destino:'perfume'},{texto:'Recordar cómo se reía contigo',destino:'risa'}]},
perfume:{lugar:'CAMINO A CASA · UNA IDEA ABSURDA',titulo:'Un perfume en una oficina vacía',texto:'Te dio vergüenza admitir cuánto te gustaba que pasara cerca. Te quedabas con el recuerdo de su perfume cuando él ya estaba en otro lugar, ocupado en una vida donde tú apenas eras parte del trabajo. «Solo me gusta cómo huele», te dijiste. Parecía una explicación suficientemente pequeña para no asustarte. No explicaba por qué te arreglabas pensando en si él lo notaría.',siguiente:'salida'},
risa:{lugar:'DESPUÉS DEL TRABAJO · EL ECO DE UNA RISA',titulo:'Lo que querías volver a escuchar',texto:'Podías olvidar una instrucción y recordar exactamente qué comentario lo había hecho reír. Te sorprendiste guardando historias para contárselas al día siguiente, ensayando mentalmente cómo sonaría el remate. Cuando se reía, el trabajo dejaba de pesarte un momento. Empezaste a esperar esos momentos con una necesidad que te daba miedo nombrar. Él probablemente solo había pasado un buen rato. Tú lo llevabas contigo hasta la casa.',siguiente:'salida'},
salida:{lugar:'LA PRIMERA SALIDA · FUERA DEL TRABAJO',titulo:'Ah, mierda. Me gusta',texto:'Un día salieron. Fuera del trabajo ya no estaban las tareas para justificar que lo miraras tanto. Andy habló, se rio y siguió siendo él. Tú sentiste ese vuelco inesperado, la certeza incómoda de que el man te atraía. No era curiosidad. No era que te hubieras acostumbrado a verlo. Te gustaba. Cada gesto que antes criticabas te pareció encantador, y te dio rabia comprobar lo fácil que tu cabeza cambiaba de versión cuando tu corazón ya había decidido.',siguiente:'intensidad'},
intensidad:{lugar:'LOS DÍAS SIGUIENTES · LA MISMA OFICINA',titulo:'Mañana se me pasa',texto:'No se pasó mañana. Ni el día siguiente. Cada jornada le añadía algo: una conversación, una risa, verlo llegar con otra camisa. Empezaste a medir el día por cuánto habían hablado. Una interacción pequeña te levantaba el ánimo durante horas; una respuesta seca podía arruinártelo. Tú seguías trabajando, aprendiendo, tratando de hacer las cosas bien. Debajo de todo eso había otra espera: que Andy te mirara una vez de una manera que no pudiera confundirse con trabajo.',siguiente:'defectos'},
defectos:{lugar:'TU HABITACIÓN · NEGOCIANDO CONTIGO',titulo:'La lista de razones para que no',texto:'Intentaste buscarle errores. Volver a lo que te molestaba al principio, recordar que era tu superior, repetirte que mezclar ese sentimiento con el trabajo podía complicarlo todo. Te propusiste dejar de idealizarlo. El problema era que encontrabas un defecto y enseguida aparecía una excusa. Donde antes habrías visto una razón para irte, ahora veías algo que podías entender. Te asustó darte cuenta de que estabas moviendo tus propios límites para que él siguiera cabiendo.',siguiente:'infidelidad'},
infidelidad:{lugar:'UNA CONVERSACIÓN · LO QUE NO ESPERABAS OÍR',titulo:'Lo que juraste no aceptar',texto:'Andy te contó que había sido infiel en su anterior relación. La frase cayó justo sobre una de esas certezas que siempre habías defendido: tú jamás aceptarías algo así. Esperaste sentir rechazo, que por fin algo apagara lo que te estaba pasando. Te preocupó lo que había dicho. Te gustó igual. No se volvió menos grave porque te atrajera; esa fue precisamente la parte que más te incomodó. Ni siquiera tu mejor argumento conseguía hacerte dejar de sentir.',opciones:[{texto:'Aferrarte a tus límites',destino:'limites'},{texto:'Admitir que todavía te gusta',destino:'contradiccion'}]},
limites:{lugar:'ESA NOCHE · TU PROPIA VOZ',titulo:'Saberlo no lo apaga',texto:'Escribiste las razones por las que no te convenía. Leíste la lista como si fuera una instrucción técnica: si sigues estos pasos, el problema debería resolverse. Pero el corazón no obedeció. Al día siguiente escuchaste su risa y sentiste lo mismo. No habías olvidado lo que contó. Ahora tenías que sostener dos cosas a la vez: algo de él chocaba con tus límites y, aun así, te seguía gustando con una intensidad que no sabías manejar.',siguiente:'amigas'},
contradiccion:{lugar:'ESA NOCHE · SIN EXCUSAS',titulo:'Me gusta. Incluso sabiendo esto',texto:'Te lo dijiste sin adornarlo. No porque quisieras defender lo que hizo, sino porque fingir que ya no te importaba no iba a hacerlo verdad. Te sentiste contradictoria, frustrada contigo misma. Habías creído que enamorarte se parecería a reconocer a alguien que encajara con todo lo que querías. En cambio, estabas mirando un límite que él había cruzado en otra relación y preguntándote por qué tu cuerpo seguía alegrándose cada vez que lo veía.',siguiente:'amigas'},
amigas:{lugar:'PAUL, SAMI Y ALI · YA NO ERA UN SECRETO',titulo:'Decir su nombre en voz alta',texto:'Se lo contaste a Paul, Sami y Ali. Primero con una risa nerviosa, como si no fuera tan serio. Después con detalles que te delataban: el perfume, la ropa, la salida, su manera de reír. Hablaron contigo, te escucharon, preguntaron qué señales te daba él. Ahí bajaste la voz. Podías contar muchísimo sobre lo que Andy te hacía sentir. Cuando tocaba hablar de lo que él parecía sentir por ti, te quedabas sin ejemplos.',siguiente:'senales'},
senales:{lugar:'OTRA SEMANA · LO QUE SÍ ESTABA PASANDO',titulo:'Tu corazón no entendía las señales',texto:'Él te ayudaba cuando algo salía mal, bromeaba contigo y después seguía con su día. No buscaba acercarse como tú querías. No había una intención romántica en la que pudieras apoyarte. Tú lo veías. Se lo admitías a tus amigas. Pero bastaba otra conversación bonita para que volvieras a pensar «¿y si...?». Lo más agotador era entender perfectamente una cosa y seguir sintiendo la contraria cada mañana.',siguiente:'oportunidad'},
oportunidad:{lugar:'ANTES DE LOS JARDINES · LA ÚLTIMA ESPERANZA',titulo:'La única persona en mucho tiempo',texto:'Hacía mucho que nadie te hacía sentir algo así. Eso era lo que más te costaba soltar: no solo a Andy, sino esa parte de ti que había vuelto a ilusionarse con alguien. Querías encontrar una oportunidad, una conversación distinta, cualquier espacio donde tal vez pudiera pasar algo. Sabías que era obvio que no habría nada entre ustedes. Aun así, todavía no podías dejar de buscarlo. Tu cabeza ya conocía la respuesta. Tu corazoncito seguía pidiendo verla de cerca.',siguiente:'jardin'},
jardin:{lugar:'LOS JARDINES · LO QUE TODAVÍA NO QUIERES SOLTAR',titulo:'Él se aleja. Tú lo buscas',texto:'Alexander y Nicolás vuelven con sus reclamos. Martín cruza en su moto. Andy está más allá: cuando intentas acercarte, se aleja; cuando los otros te acorralan, te ayuda a librarte de ellos. Esa contradicción te alcanza justo donde más duele. Una ayuda suya vuelve a parecerte una oportunidad, aunque sabes que no es lo mismo. Paul, Sami y Ali siguen a tu lado. Cruzas el primer jardín con dos deseos que todavía no consigues separar: salir de este drama y llegar hasta él.',siguiente:null}
};
const RECUERDOS_ANDY=[
'Recuerdas tu primer trabajo y al superior que al principio te caía mal.',
'Su perfume y su risa siguen contigo. Su ayuda te hace volver a ilusionarte.',
'Buscaste defectos. Ni saber que fue infiel consiguió apagar lo que sentías.',
'Paul, Sami y Ali conocen tu secreto. Tú conoces las señales, aunque duelan.',
'Hacía mucho que nadie te hacía sentir así. Todavía quieres una oportunidad.'
];

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
  }else if(nombre==='Martín'){
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
    if(nombre==='Martín'){g.fillStyle(0xa4667d);g.fillRect(17,30,6,2);}
    if(nombre==='Nicolás'){g.lineStyle(1,0x6a526b);g.lineBetween(17,33,35,33);}
  }
  if(nombre==='Martín'){
    // Moto y mochila de delivery, dibujadas con gráficos nativos.
    g.fillStyle(0x203447);g.fillRoundedRect(0,24,17,25,3);
    g.fillStyle(0xffbd59);g.fillRoundedRect(2,26,13,20,2);
    g.lineStyle(2,0xffffff);g.strokeRect(5,30,7,10);
    g.fillStyle(0x303246);g.fillCircle(11,55,9);g.fillCircle(44,55,9);
    g.fillStyle(0xc6d9e0);g.fillCircle(11,55,4);g.fillCircle(44,55,4);
    g.fillStyle(0x36aeba);g.fillRoundedRect(10,43,32,9,4);
    g.lineStyle(3,0x344a61);g.lineBetween(34,36,44,54);g.lineBetween(34,36,42,36);
    g.fillStyle(0xffedac);g.fillCircle(45,41,4);
    g.fillStyle(0x36aeba);g.fillEllipse(27,6,35,13);
  }
  g.generateTexture(key,54,64);g.destroy();
  return key;
}
function crearSprites(s){
  generarPersonaje(s,'chica',0xf76ca8,0x6e375d);
  generarPersonaje(s,'Martín',0x36aeba,0x45392f);
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
  const puntos={Martín:[861,148],Alexander:[870,486],Nicolás:[470,145],Andy:[140,502]};
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
  if(nivelSecretoAndy){
    const resumen='Nivel secreto · Alcanza a Andy · ⏱ '+tiempoFmt(totalSegundos);
    txtEstado.setText(resumen);txtComodines.setText('Solo tú y Andy');
    estadoMovil(resumen);
    for(let i=0;i<3;i++){
      const b=document.getElementById('helper'+i);if(b)b.disabled=true;
    }
    return;
  }
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
  nivelSecretoAndy=false;
  window.resetearMovimientoTactil?.();
  limpiarPanel();liberarEscenario();
  const tema=CAPITULOS[(capitulo-1)%CAPITULOS.length];
  crearFondo(s,tema);
  crearJardin(s,capitulo);
  recogidas=0;etapaSegundos=0;txtAviso.setVisible(false);avisoHasta=0;
  martinDisponibleEn=s.time.now+2500;rutaMartin=1;objetivoAndy=null;
  necesarias=Math.min(3+capitulo,9);
  crearCorazones(s,necesarias);
  crearSalida(s);
  actualizarSalida();
  jugadora.setPosition(136,310).setVelocity(0).clearTint().setAlpha(1);
  const posiciones={Martín:[861,145],Alexander:[860,498],Nicolás:[510,139],Andy:[132,507]};
  for(const [nombre,ch] of Object.entries(chicos)){
    const [x,y]=posiciones[nombre];ch.setPosition(x,y).setVelocity(0).clearTint().setAlpha(1);
  }
  setPersonajesVisibles(true);
  pantallaHUD.setVisible(true);s.data.get('banda').setVisible(true);txtFrase.setVisible(true);
  congeladosHasta=0;inmuneHasta=s.time.now+1700;andyDisponibleEn=s.time.now+2000;ralentizadaHasta=0;
  banderaSiguiente=s.time.now+2300;fraseSiguiente=s.time.now+4700;
  txtFrase.setText('🌷 '+tema.titulo+' — '+tema.sub+'   ¡Consigue '+necesarias+' corazones para abrir la salida!');
  if(citaElegida==='Andy')txtFrase.setText('🌙 '+RECUERDOS_ANDY[(capitulo-1)%RECUERDOS_ANDY.length]+' Reúne '+necesarias+' corazones.');
  fraseHasta=s.time.now+5500;
  estado='jugando';actualizarHUD();
}
function nuevaPartida(s,eleccion){
  nivelSecretoAndy=false;
  modo=eleccion;capitulo=1;vida=1;
  totalSegundos=0;esquivadas=0;comodas=[false,false,false];
  citaElegida=null;recuerdosAndy=[];cierreAndy=null;
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
  const p=basePanel(s,'ANTES DE AQUELLA NOCHE','¿Con quién quieres salir?\nAndy tiene un prólogo interactivo completo.\nLas historias de Alex, Nico y Martín están por venir.');
  const candidatos=[['Alex','Alexander'],['Nico','Nicolás'],['Andy','Andy'],['Martín','Martín']];
  candidatos.forEach(([nombre,personaje],i)=>{
    const x=210+i*180;
    p.add(s.add.image(x,346,'personaje_'+personaje).setScale(1.25));
    boton(s,p,x,421,162,52,nombre,()=>{
      citaElegida=personaje;recuerdosAndy=[];cierreAndy=null;
      if(personaje==='Andy'){escenaAndy='inicio';dibujarHistoriaAndy(s);}
      else dibujarRutaPendiente(s,nombre);
    },personaje==='Andy'?0x6889ae:0xb28ac7);
  });
  boton(s,p,480,497,235,40,'VOLVER AL MENÚ',()=>dibujarMenu(s),0x9f86cc);
}
function dibujarRutaPendiente(s,nombre){
  pausarParaRelato(s,'rutaPendiente');
  estadoMovil('Elegiste a '+nombre+' · Historia pendiente');
  const p=basePanel(s,'ELEGISTE A '+nombre.toUpperCase(),'Su historia todavía está por escribirse.\nPuedes continuar a la introducción del juego\no volver y descubrir la historia de Andy.');
  p.add(s.add.image(480,364,'personaje_'+citaElegida).setScale(1.4));
  boton(s,p,310,476,280,52,'CAMBIAR ELECCIÓN',()=>dibujarEleccion(s),0x9f86cc);
  boton(s,p,650,476,280,52,'IR A LA INTRODUCCIÓN',()=>dibujarIntro(s,0));
}
function avanzarHistoriaAndy(s,destino){
  recuerdosAndy.push({escena:escenaAndy,cierre:cierreAndy});
  if(HISTORIA_ANDY[escenaAndy].cierre)cierreAndy=HISTORIA_ANDY[escenaAndy].cierre;
  escenaAndy=destino;dibujarHistoriaAndy(s);
}
function dibujarHistoriaAndy(s){
  pausarParaRelato(s,'historiaAndy');limpiarPanel();
  const pagina=HISTORIA_ANDY[escenaAndy];
  estadoMovil('Andy · '+pagina.titulo);
  panel=s.add.container(0,0).setDepth(100);
  panel.add(s.add.rectangle(480,300,W,H,0x211f35,.99));
  panel.add(s.add.rectangle(480,300,858,554,0x302b46).setStrokeStyle(2,0x786485));
  panel.add(s.add.text(90,55,'ANDY / '+pagina.lugar,{fontFamily:'Arial',fontSize:'15px',color:'#c8b3ce'}));
  panel.add(s.add.text(90,91,pagina.titulo,{fontFamily:'Arial',fontSize:'32px',fontStyle:'bold',color:'#ffd7e5',wordWrap:{width:780}}));
  panel.add(s.add.text(90,155,pagina.texto,{fontFamily:'Arial',fontSize:'21px',color:'#f4eaf4',lineSpacing:9,wordWrap:{width:780}}));
  if(pagina.opciones){
    pagina.opciones.forEach((op,i)=>boton(s,panel,285+i*390,478,370,62,op.texto,()=>avanzarHistoriaAndy(s,op.destino),i?0x806789:0x577c99));
  }else{
    boton(s,panel,630,478,465,56,pagina.siguiente?'CONTINUAR →':'CONTINUAR A LA INTRODUCCIÓN',()=>{
      if(pagina.siguiente)avanzarHistoriaAndy(s,pagina.siguiente);
      else dibujarIntro(s,0);
    },0x577c99);
  }
  if(recuerdosAndy.length)boton(s,panel,205,548,230,36,'← VOLVER A LEER',()=>{
    const anterior=recuerdosAndy.pop();escenaAndy=anterior.escena;cierreAndy=anterior.cierre;dibujarHistoriaAndy(s);
  },0x594c6c);
  boton(s,panel,725,548,270,36,'CAMBIAR PERSONAJE',()=>dibujarEleccion(s),0x594c6c);
}
function introduccionActual(paso){
  if(citaElegida!=='Andy')return INTRO[paso];
  if(paso===0)return {titulo:'El trabajo, Andy y tú',texto:'Entraste asustada a tu primer trabajo técnico. Andy, tu superior, pasó de caerte mal a hacerte sentir algo que no sentías desde hacía mucho. Él no muestra interés romántico, pero tú todavía buscas una oportunidad. Ahora atraviesas los jardines, esquivando a Alexander y Nicolás y buscando a Andy. Paul, Sami y Ali conocen tu historia y te ayudarán a seguir.',personaje:'chica'};
  if(paso===4)return {titulo:'Andy · Se aleja, pero te ayuda',texto:'Andy huye cuando te acercas en todos los jardines. Si lo alcanzas, congela a Alexander y Nicolás durante 7 segundos; después necesita descansar. Tú sigues buscando una oportunidad, aunque sus señales no sean románticas. Completa los cinco jardines para descubrir cómo termina esta búsqueda.',personaje:'Andy'};
  return INTRO[paso];
}

function dibujarIntro(s,paso){
  estado='intro';detenerMovimiento();setPersonajesVisibles(false);
  pantallaHUD.setVisible(false);s.data.get('banda').setVisible(false);
  txtFrase.setVisible(false);txtAviso.setVisible(false);
  window.resetearMovimientoTactil?.();
  const historia=introduccionActual(paso);
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='📖 '+(paso+1)+'/'+INTRO.length+' · '+historia.titulo;
  const p=basePanel(s,historia.titulo,historia.texto);
  if(historia.personaje){
    p.add(s.add.image(480,378,'personaje_'+historia.personaje).setScale(1.25));
  }else{
    p.add(s.add.text(480,375,'🛟 '+AMIGAS[paso-5],{fontFamily:'Arial',fontSize:'30px',color:'#a53575'}).setOrigin(.5));
  }
  p.add(s.add.text(480,425,(paso+1)+' / '+INTRO.length,{fontFamily:'Arial',fontSize:'15px',color:'#80536f'}).setOrigin(.5));
  if(paso===0)boton(s,p,240,480,170,48,'← PRÓLOGO',()=>citaElegida==='Andy'?dibujarHistoriaAndy(s):dibujarEleccion(s),0x9f86cc);
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
  nivelSecretoAndy=false;
  window.resetearMovimientoTactil?.();
  estado='menu';
  const statsMovil=document.getElementById('mobile-status');
  if(statsMovil)statsMovil.textContent='💗 Elige HISTORIA o MODO INFINITO para comenzar';liberarEscenario();setPersonajesVisibles(false);
  pantallaHUD.setVisible(false);s.data.get('banda').setVisible(false);txtFrase.setVisible(false);txtAviso.setVisible(false);
  const tela=s.add.graphics().setDepth(-3);tela.fillStyle(0xfff0f8);tela.fillRect(0,0,960,600);
  for(let x=0;x<960;x+=58)for(let y=0;y<600;y+=58){tela.fillStyle(0xffd0e5,.23);tela.fillCircle(x,y,7);}
  elementos.push(tela);
  const p=basePanel(s,'¡HUYE, AMIGA, HUYE!','Alexander y Nicolás te persiguen. Andy huye: ¡búscalo!\nMartín reparte sorpresas en moto: 50 % ayuda, 50 % lío.\nConoce la historia, reúne corazones y escapa con tus amigas.');
  ['Martín','Alexander','Nicolás','Andy'].forEach((n,i)=>{
    const x=280+i*135;
    const sprite=s.add.image(x,341,'personaje_'+n).setScale(1.17);
    const label=s.add.text(x,391,n,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:n==='Andy'?'#289b78':'#ab5077'}).setOrigin(.5);
    p.add([sprite,label]);
  });
  boton(s,p,278,460,225,48,'📖 HISTORIA · 5 ETAPAS',()=>nuevaPartida(s,'historia'));
  boton(s,p,523,460,225,48,'♾️ MODO INFINITO',()=>nuevaPartida(s,'infinito'),0x9e83cd);
  boton(s,p,765,460,210,48,'💬 LIBRO DE FRASES',()=>dibujarGaleria(s),0x64bba0);
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
  if(estado!=='jugando'||nivelSecretoAndy||comodas[index])return false;
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
  if(nivelSecretoAndy){rechazoFinalAndy(s);return;}
  if(t<andyDisponibleEn)return;
  congeladosHasta=Math.max(congeladosHasta,t+7000);
  andyDisponibleEn=t+15000;
  chicos.Andy.setVelocity(0);objetivoAndy=null;
  aviso(s,'💚 ¡Alcanzaste a Andy! 7 segundos de paz: perseguidores congelados.','#268a6a',3400);
  fraseAlPaso(s,'Andy',sacarFrase('Andy'),4700);
  actualizarHUD();
}
function puntoSeguro(){
  const candidatos=RECOGIDAS.filter(([x,y])=>!arbustos.getChildren().some(o=>{
    const r=o.getBounds();return x>r.left-24&&x<r.right+24&&y>r.top-28&&y<r.bottom+28;
  }));
  const distancia=p=>Math.min(...VILLANOS.map(n=>Math.hypot(p[0]-chicos[n].x,p[1]-chicos[n].y)));
  return candidatos.reduce((mejor,p)=>distancia(p)>distancia(mejor)?p:mejor,candidatos[0]||[136,310]);
}
function mostrarFotoMartin(s){
  const foto=s.add.container(790,210).setDepth(35);
  const dibujo=s.add.graphics();
  dibujo.fillStyle(0xffffff);dibujo.fillRoundedRect(-79,-67,158,137,8);
  dibujo.fillStyle(0xffd6e8);dibujo.fillRect(-69,-57,138,98);
  dibujo.fillStyle(0x36aeba);dibujo.fillEllipse(-23,26,51,43);
  dibujo.fillStyle(0xec78ae);dibujo.fillEllipse(23,26,51,43);
  dibujo.fillStyle(0x69402d);dibujo.fillEllipse(27,-16,39,44);
  dibujo.fillStyle(0xf3c3a2);dibujo.fillCircle(-17,-9,19);dibujo.fillCircle(17,-9,19);
  dibujo.fillStyle(0x45392f);dibujo.fillEllipse(-21,-25,35,13);
  dibujo.lineStyle(2,0x6e375d);dibujo.lineBetween(-15,-10,-8,-10);dibujo.lineBetween(8,-10,15,-10);
  dibujo.fillStyle(0xe64c86);dibujo.fillCircle(0,0,4);
  foto.add([dibujo,s.add.text(0,-40,'♥',{fontSize:'23px',color:'#dc397b'}).setOrigin(.5),
    s.add.text(0,55,'Martín y una chica',{fontFamily:'Arial',fontSize:'13px',color:'#a53575'}).setOrigin(.5)]);
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
function moverAndy(t){
  const a=chicos.Andy;
  const distancia=Math.hypot(jugadora.x-a.x,jugadora.y-a.y);
  // Busca refugios lejanos para huir sin atascarse en una esquina.
  if(!objetivoAndy||Math.hypot(a.x-objetivoAndy[0],a.y-objetivoAndy[1])<25||
    (distancia<210&&Math.hypot(jugadora.x-objetivoAndy[0],jugadora.y-objetivoAndy[1])<distancia)){
    const refugios=[[90,155],[480,145],[875,155],[875,490],[480,510],[90,490]];
    objetivoAndy=refugios.filter(p=>Math.hypot(a.x-p[0],a.y-p[1])>75)
      .sort((p,q)=>Math.hypot(jugadora.x-q[0],jugadora.y-q[1])-Math.hypot(jugadora.x-p[0],jugadora.y-p[1]))[0];
  }
  const dx=objetivoAndy[0]-a.x,dy=objetivoAndy[1]-a.y,d=Math.hypot(dx,dy)||1;
  const v=Math.min(172,125+capitulo*6);
  a.setVelocity(dx/d*v,dy/d*v);
  a.setAlpha(t<andyDisponibleEn?0.5:1);
  if(distancia<38)contactoAndy(escena,t);
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
  if(modo==='historia'&&citaElegida==='Andy'&&capitulo===CAPITULOS.length){
    anunciarNivelSecretoAndy(s);return;
  }
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

  if(nivelSecretoAndy){
    moverAndy(t);
    if(estado==='jugando')actualizarHUD();
    return;
  }

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
  moverAndy(t);
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
  if(t>=fraseHasta)txtFrase.setText('🏃 Esquiva las 🚩  ·  💗 Reúne corazones  ·  🛟 Cuida tus 3 comodines  ·  💚 Alcanza a Andy  ·  🛵 Martín: 50/50');
  if(t>=avisoHasta)txtAviso.setVisible(false);
  actualizarHUD();
}

function anunciarNivelSecretoAndy(s){
  pausarParaRelato(s,'secretoDesbloqueado');
  estadoMovil('Ruta de Andy · Nivel secreto desbloqueado');
  const p=basePanel(s,'UNA ÚLTIMA OPORTUNIDAD','Superaste los cinco jardines. Los otros quedaron atrás.\n\nAndy sigue alejándose y tú todavía necesitas intentarlo una vez más. Esta vez no hay corazones que reunir ni una puerta que abrir. Solo tienes que alcanzarlo.');
  boton(s,p,330,476,300,56,'BUSCAR A ANDY',()=>prepararNivelSecretoAndy(s));
  boton(s,p,655,476,260,56,'MENÚ PRINCIPAL',()=>dibujarMenu(s),0x9f86cc);
}
function prepararNivelSecretoAndy(s){
  if(citaElegida!=='Andy'||modo!=='historia'||capitulo!==CAPITULOS.length)return;
  window.resetearMovimientoTactil?.();
  limpiarPanel();detenerMovimiento();setPersonajesVisibles(false);liberarEscenario();
  nivelSecretoAndy=true;capitulo=CAPITULOS.length+1;etapaSegundos=0;
  crearFondo(s,{suelo:0x302b46,borde:0x9374a3,planta:0x786485});
  jugadora.setPosition(136,310).setVelocity(0).clearTint().setAlpha(1);
  chicos.Andy.setPosition(790,310).setVelocity(0).clearTint().setAlpha(1);
  for(const personaje of [jugadora,chicos.Andy]){
    personaje.setVisible(true).setActive(true);personaje.body.enable=true;
  }
  objetivoAndy=null;andyDisponibleEn=0;inmuneHasta=0;ralentizadaHasta=0;
  pantallaHUD.setVisible(true);s.data.get('banda').setVisible(true);
  txtAviso.setVisible(false);txtFrase.setVisible(true).setText('Andy vuelve a alejarse. WASD / flechas o controles táctiles para alcanzarlo.');
  estado='jugando';actualizarHUD();
}
function rechazoFinalAndy(s){
  if(!nivelSecretoAndy||estado!=='jugando')return;
  pausarParaRelato(s,'rechazoAndy');
  recordHistoria++;
  try{localStorage.setItem('huye_historia_tiempo',String(recordHistoria))}catch(e){}
  estadoMovil('Andy · La respuesta final');
  const p=basePanel(s,'ANDY · LA RESPUESTA','Por fin lo alcanzas. Sin los otros cerca, sin un error del trabajo que sirva de excusa, le dices que quieres una oportunidad. Andy te mira.\n\n«Nunca me sentiré atraído por alguien como tú».\n\nEso es todo. No hay un quizá después. Tú todavía recuerdas su perfume, su ropa, su risa. Él ya terminó de hablar.',true);
  boton(s,p,480,476,340,56,'CONTINUAR',()=>dibujarEpilogoAndy(s),0x806789);
}
function dibujarEpilogoAndy(s){
  pausarParaRelato(s,'epilogoAndy');
  estadoMovil('Andy · Después de la respuesta');
  const p=basePanel(s,'LO QUE QUEDA DESPUÉS','Paul, Sami y Ali te esperan. Intentas contarles lo que dijo, pero la voz se te rompe antes de terminar. Llevabas tanto tiempo buscando una oportunidad que no habías pensado qué hacer cuando ya no quedara ninguna.\n\nMañana seguirá siendo tu superior. Tendrás que volver al trabajo, escuchar su risa y aprender a vivir con una respuesta que tu cabeza ya sabía y tu corazón no quería escuchar. Esta noche, tus amigas se quedan contigo.',true);
  boton(s,p,330,476,280,56,'VOLVER A JUGAR',()=>nuevaPartida(s,'historia'));
  boton(s,p,650,476,280,56,'MENÚ PRINCIPAL',()=>dibujarMenu(s),0x9f86cc);
}
