const W=800,H=550;
const nombres=['Diego','Alexander','Nicolás','Andy'];
const frases={
Diego:['Yo no soy como los demás.','Es que tú me malinterpretaste.','¿Y por qué eres tan complicada?'],
Alexander:['Si tú me dices tonto, no me voy a ofender, no tengo cinco años.','Ahora que te arreglas más, me atraes más.','¿Compañero? *se ofende*'],
Nicolás:['La confianza es lo primero.','¿Quieres hablar de eso o solo quieres terminar?','No quiero nada serio, pero no hables con otros.'],
Andy:['Te alcancé, pero tranquila: respeto tu espacio.','¿Estás bien? Si quieres, seguimos jugando.','No tienes que darme explicaciones. ¿Otra partida?']
};
let chica,villano,teclas,wasd,tiempo,marcador,estado='menu',inicio=0,nombre='',record=0,panel;
let banderas=[],esquivadas=0,proximaBandera=0,ralentizadaHasta=0;
try{record=Number(localStorage.getItem('huye_record')||0)}catch(e){}
const config={type:Phaser.AUTO,width:W,height:H,parent:'game',backgroundColor:'#ffe9f4',physics:{default:'arcade',arcade:{debug:false}},scene:{create,update},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH}};
new Phaser.Game(config);
function personaje(scene,key,vestido,pelo,estilo='normal'){
 let g=scene.make.graphics({x:0,y:0});
 g.fillStyle(0x000000,0.12);g.fillEllipse(22,45,31,7);
 g.fillStyle(vestido);g.fillRoundedRect(9,23,26,22,estilo==='chica'?9:3);
 g.fillStyle(estilo==='andy'?0xf2c7a5:0xffd2ae);g.fillCircle(22,17,13);
 g.fillStyle(pelo);
 if(estilo==='alexander'){g.fillTriangle(7,14,17,0,21,13);g.fillTriangle(18,11,29,0,35,15);}
 else if(estilo==='nicolas'){g.fillRoundedRect(8,4,28,10,2);g.fillRect(6,11,9,7);}
 else if(estilo==='diego'){g.fillEllipse(22,9,32,13);g.fillRect(7,8,7,8);}
 else {g.fillEllipse(22,9,29,13);}
 g.fillStyle(0x402639);g.fillCircle(17,18,1.8);g.fillCircle(27,18,1.8);
 if(estilo==='andy'){g.lineStyle(1.4,0x855a53);g.beginPath();g.arc(22,23,5,0.15,Math.PI-0.15,false);g.strokePath();}
 else if(estilo!=='chica'){g.lineStyle(2,0x513d45);g.lineBetween(16,24,28,22);g.fillStyle(0x654052);g.fillRect(11,14,8,2);g.fillRect(25,14,8,2);}
 if(estilo==='chica'){g.fillStyle(0xff87a6);g.fillCircle(12,22,3);g.fillCircle(32,22,3);}
 g.generateTexture(key,44,49);g.destroy();
}
function create(){const s=this;for(let i=0;i<35;i++){let x=Phaser.Math.Between(25,775),y=Phaser.Math.Between(55,525);s.add.text(x,y,['🌸','🌷','✨','🌼'][i%4],{fontSize:'20px',color:'#edb1d2'}).setAlpha(.65)}personaje(s,'chica',0xf26eaa,0x74405b,'chica');personaje(s,'Diego',0x91836b,0x403322,'diego');personaje(s,'Alexander',0x8e8b42,0x50312b,'alexander');personaje(s,'Nicolás',0x80738e,0x29252c,'nicolas');personaje(s,'Andy',0x6a9baf,0x513a31,'andy');chica=s.physics.add.sprite(400,275,'chica').setCollideWorldBounds(true).setDepth(2);villano=s.physics.add.sprite(80,80,'Diego').setCollideWorldBounds(true).setDepth(2);chica.setVisible(false);villano.setVisible(false);teclas=s.input.keyboard.createCursorKeys();wasd=s.input.keyboard.addKeys('W,A,S,D');marcador=s.add.text(16,14,'',{fontSize:'21px',fontStyle:'bold',color:'#a02d68'}).setDepth(4);panel=s.add.container(0,0).setDepth(10);mostrarMenu(s)}
function limpiar(){panel.removeAll(true)}
function caja(s,titulo,sub,boton,accion){limpiar();let bg=s.add.rectangle(400,275,580,325,0xffffff,.96).setStrokeStyle(4,0xf3a3cb);let a=s.add.text(400,165,titulo,{fontSize:'32px',fontStyle:'bold',color:'#a32969',align:'center',wordWrap:{width:530}}).setOrigin(.5);let b=s.add.text(400,265,sub,{fontSize:'21px',color:'#7e4365',align:'center',wordWrap:{width:510},lineSpacing:9}).setOrigin(.5);let bt=s.add.rectangle(400,378,245,54,0xec69a4).setInteractive({useHandCursor:true});let label=s.add.text(400,378,boton,{fontSize:'22px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);bt.on('pointerdown',accion);panel.add([bg,a,b,bt,label])}
function mostrarMenu(s){estado='menu';marcador.setText('');caja(s,'💖 ¡HUYE, AMIGA, HUYE!','Escapa de Diego, Alexander, Nicolás o Andy.\nEsquiva las 🚩 que vuelan hacia ti. Si te tocan, te ralentizan.\n¿Cuánto tiempo podrás escapar?\n🏆 Récord: '+record.toFixed(1)+' s','¡JUGAR!',()=>empezar(s))}
function empezar(s){limpiar();banderas.forEach(b=>b.obj.destroy());banderas=[];esquivadas=0;ralentizadaHasta=0;proximaBandera=s.time.now+2200;estado='juego';nombre=Phaser.Utils.Array.GetRandom(nombres);villano.setTexture(nombre);chica.setPosition(400,275).setVisible(true).setVelocity(0);let puntos=[[35,35],[765,35],[35,515],[765,515]];let p=Phaser.Utils.Array.GetRandom(puntos);villano.setPosition(p[0],p[1]).setVisible(true).setVelocity(0);inicio=s.time.now;tiempo=0}
function perder(s){estado='fin';chica.setVelocity(0);villano.setVelocity(0);if(tiempo>record){record=tiempo;try{localStorage.setItem('huye_record',String(record))}catch(e){}}let frase=Phaser.Utils.Array.GetRandom(frases[nombre]);caja(s,(nombre==='Andy'?'💚 ¡GREEN FLAG ENCONTRADA!':'💔 ¡TE ATRAPÓ '+nombre.toUpperCase()+'!'),(nombre==='Andy'?'Andy te encontró, pero respeta tus límites. 💚\n':'«'+frase+'»\n')+'\n⏱ Duraste '+tiempo.toFixed(1)+' segundos\n🚩 Red flags esquivadas: '+esquivadas+'\n🏆 Récord: '+record.toFixed(1)+' s',nombre==='Andy'?'VOLVER A JUGAR':'OTRA VEZ',()=>empezar(s))}
function crearBandera(s,t){let lado=Phaser.Math.Between(0,3);let x=lado===0?-25:lado===1?W+25:Phaser.Math.Between(20,W-20);let y=lado===2?-25:lado===3?H+25:Phaser.Math.Between(20,H-20);let dx=chica.x-x,dy=chica.y-y,dist=Math.hypot(dx,dy)||1;let rapidez=125+Math.min(100,tiempo*2);let obj=s.add.text(x,y,'🚩',{fontSize:'27px'}).setOrigin(.5).setDepth(3);banderas.push({obj,vx:dx/dist*rapidez,vy:dy/dist*rapidez});}
function update(t,delta){if(estado!=='juego')return;tiempo=(t-inicio)/1000;let x=Number(teclas.right.isDown||wasd.D.isDown)-Number(teclas.left.isDown||wasd.A.isDown),y=Number(teclas.down.isDown||wasd.S.isDown)-Number(teclas.up.isDown||wasd.W.isDown);let m=Math.hypot(x,y)||1;chica.setVelocity(x/m*(t<ralentizadaHasta?155:245),y/m*(t<ralentizadaHasta?155:245));
if(t>=proximaBandera){crearBandera(this,t);proximaBandera=t+Math.max(1050,2400-tiempo*13);}
for(let i=banderas.length-1;i>=0;i--){let b=banderas[i];b.obj.x+=b.vx*delta/1000;b.obj.y+=b.vy*delta/1000;let tocada=Math.hypot(chica.x-b.obj.x,chica.y-b.obj.y)<26;let fuera=b.obj.x< -40||b.obj.x>W+40||b.obj.y< -40||b.obj.y>H+40;if(tocada||fuera){if(tocada)ralentizadaHasta=t+1100;else esquivadas++;b.obj.destroy();banderas.splice(i,1);}}let dx=chica.x-villano.x,dy=chica.y-villano.y,d=Math.hypot(dx,dy)||1;let v=Math.min(290,95+tiempo*4.3);villano.setVelocity(dx/d*v,dy/d*v);marcador.setText('⏱ '+tiempo.toFixed(1)+' s    🚩 Esquivadas: '+esquivadas+'    👀 '+nombre);if(d<31)perder(this)}
