/* Arte procedural del juego. Phaser 3 Graphics: sin imágenes ni fuentes externas.
   Coordenadas de personaje: 54 × 64; se conservan las cajas de colisión originales.
   Las texturas se hornean una sola vez y se reutilizan durante las partidas. */
'use strict';
const SpritesJuego=(()=>{
  const tinta=0x49394f;
  function pincel(g){
    return {
      el(x,y,w,h,c,a=1){g.fillStyle(c,a);g.fillEllipse(x,y,w,h);},
      ci(x,y,r,c,a=1){g.fillStyle(c,a);g.fillCircle(x,y,r);},
      rr(x,y,w,h,r,c){g.fillStyle(c);g.fillRoundedRect(x,y,w,h,r);},
      ln(x,y,x2,y2,c,w=1,a=1){g.lineStyle(w,c,a);g.lineBetween(x,y,x2,y2);},
      tr(x,y,x2,y2,x3,y3,c){g.fillStyle(c);g.fillTriangle(x,y,x2,y2,x3,y3);}
    };
  }
  function estrella(g,x,y,r,c){
    const p=pincel(g);p.tr(x,y-r,x-r*.3,y,x+r*.3,y,c);p.tr(x,y+r,x-r*.3,y,x+r*.3,y,c);
    p.tr(x-r,y,x,y-r*.3,x,y+r*.3,c);p.tr(x+r,y,x,y-r*.3,x,y+r*.3,c);
  }
  function flor(g,x,y,r,color){
    const p=pincel(g);
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;p.ci(x+Math.cos(a)*r*.58,y+Math.sin(a)*r*.58,r*.43,color);}
    p.ci(x,y,r*.31,0xe9b65d);p.ci(x-.35,y-.4,r*.13,0xfff5cf);
  }
  // Personajes a mano sobre una cuadrícula de 27 × 32 píxeles, ampliada al doble.
  // Solo rectángulos enteros: siluetas escalonadas y bordes nítidos como la referencia.
  const CABELLOS={castano:0x704a35,negro:0x292733,rubio:0xd6b875,cobrizo:0xb35e3d,rosa:0xcb719e,plata:0xc6cad2};
  const OJOS={castanos:0x795035,azules:0x4d9ebc,verdes:0x638958,miel:0xba904a,violetas:0x9273b2};
  let claveProta='personaje_chica';
  function tono(color,factor){
    const c=Phaser.Display.Color.IntegerToRGB(color);
    return (Math.min(255,Math.round(c.r*factor))<<16)|(Math.min(255,Math.round(c.g*factor))<<8)|Math.min(255,Math.round(c.b*factor));
  }
  function personaje(s,nombre,opciones={},key='personaje_'+nombre){
    if(s.textures.exists(key))return key;
    const g=s.make.graphics({x:0,y:0,add:false});
    const r=(x,y,w,h,c)=>{g.fillStyle(c);g.fillRect(x*2,y*2,w*2,h*2);};
    const chica=nombre==='chica'||nombre==='extra',alex=nombre==='Alexander',nico=nombre==='Nicolás',moto=nombre==='Martín';
    const borde=0x25272b,piel=chica?0xefbd9c:nico?0xf0cdb1:0xc8946b;
    const sombra=tono(piel,.77),luz=tono(piel,1.1);
    const pelo=chica?(CABELLOS[opciones.cabello]??CABELLOS.castano):nico?0x795039:alex?0x45362b:0x302c28;
    const brillo=tono(pelo,1.38),oscuro=tono(pelo,.66);
    const ojos=chica?(OJOS[opciones.ojos]??OJOS.castanos):nico?0x688c83:0x65452f;
    const ropa=chica?(opciones.ropa||'vestido'):'';
    const tela=chica?(ropa==='chaqueta'?0x708b77:ropa==='overol'?0x638eac:0xcc7298):nico?0x53657d:alex?0x80815c:0x468e93;
    const costura=tono(tela,1.32),pliegue=tono(tela,.64);
    // Sombra escalonada bajo las botas.
    r(6,30,15,2,0xcbb9bf);r(8,29,11,2,0xdaccd0);
    // Pelo trasero; los mechones enmarcan la cara sin ocultar el color de ojos.
    if(chica){r(7,3,13,16,borde);r(6,7,15,12,borde);r(7,6,13,13,oscuro);r(8,5,11,13,pelo);r(7,18,3,3,oscuro);r(17,18,3,3,oscuro);}
    // Pantalón, rodillas, botas de suela clara y pequeños reflejos.
    r(8,22,11,4,borde);r(8,25,5,6,borde);r(14,25,5,6,borde);
    r(9,23,3,6,0x3e4248);r(15,23,3,6,0x363940);r(9,26,3,1,0x5a6067);r(15,26,3,1,0x525861);
    r(7,29,6,3,borde);r(14,29,6,3,borde);r(8,29,3,1,0x858a90);r(15,29,3,1,0x858a90);
    r(8,31,4,1,0xd5c6b4);r(15,31,4,1,0xd5c6b4);
    // Cuello y mangas con contorno de un píxel.
    r(11,12,5,4,borde);r(12,12,3,3,sombra);r(12,13,3,1,piel);
    r(7,15,13,8,borde);r(5,17,3,7,borde);r(19,17,3,7,borde);
    r(6,17,2,4,tela);r(19,17,2,4,pliegue);r(6,21,2,4,sombra);r(19,21,2,4,sombra);
    r(6,21,1,3,piel);r(20,21,1,3,luz);r(7,23,1,1,luz);r(19,23,1,1,piel);
    r(8,15,11,8,tela);r(9,15,2,7,costura);r(17,16,2,7,pliegue);r(8,22,11,1,pliegue);
    if(chica&&ropa==='vestido'){
      r(8,22,11,2,borde);r(7,24,13,2,borde);r(8,22,11,3,tela);r(9,24,2,1,costura);r(13,23,1,2,pliegue);r(17,23,1,2,pliegue);
      r(11,15,5,1,0xfce8d4);r(13,17,1,2,0xffe3ae);r(12,18,3,1,0xffe3ae);
      r(9,26,3,3,piel);r(15,26,3,3,piel);r(9,28,3,1,0xffe6d8);r(15,28,3,1,0xffe6d8);
      r(8,21,11,1,0xf5cf98);r(13,21,1,1,0xfff1cd);
    }else if(chica&&ropa==='overol'){
      r(8,15,11,3,0xe8dbc5);r(9,15,2,7,tela);r(16,15,2,7,tela);r(10,18,7,6,tela);
      r(11,19,5,3,pliegue);r(11,19,5,1,costura);r(10,17,1,1,0xf7d589);r(16,17,1,1,0xf7d589);
      r(9,24,3,5,tela);r(15,24,3,5,pliegue);r(9,27,3,1,costura);r(15,27,3,1,costura);
    }else{
      // Chaqueta con cuello, camiseta oscura, cremallera y bolsillos.
      r(12,15,3,8,borde);r(11,15,1,3,costura);r(15,15,1,3,costura);r(13,16,1,6,0x7d8581);
      r(9,18,2,2,pliegue);r(16,18,2,2,pliegue);r(9,18,2,1,costura);r(16,18,2,1,costura);
      r(9,22,9,1,costura);r(13,21,1,2,0xc0bba0);r(6,20,2,1,borde);r(19,20,2,1,borde);
    }
    // Orejas, mandíbula y planos de luz del rostro.
    r(7,7,13,5,borde);r(8,7,1,4,sombra);r(19,7,1,4,sombra);
    r(9,4,9,9,borde);r(10,5,7,8,piel);r(9,6,9,5,piel);r(10,11,7,2,sombra);r(11,11,5,1,piel);
    r(10,6,2,3,luz);r(17,7,1,4,sombra);r(8,8,1,2,piel);r(19,8,1,2,piel);
    // Ojos altos de tres píxeles, blancos y reflejo como en el ejemplo.
    for(const x of [10,15]){r(x,8,2,3,0xf9eee0);r(x+1,8,1,3,ojos);r(x+1,8,1,1,tono(ojos,1.4));r(x,7,2,1,borde);}
    r(13,10,1,1,sombra);r(12,12,3,1,chica?0xb46d76:0x936b58);
    if(chica){r(9,10,1,1,0xdd9393);r(17,10,1,1,0xdd9393);r(9,7,1,1,borde);r(17,7,1,1,borde);r(8,11,1,1,0xf5d591);r(19,11,1,1,0xf5d591);}
    // Flequillo por capas: masas oscuras, tonos intermedios y mechones iluminados.
    r(9,1,9,1,borde);r(7,2,13,3,borde);r(6,4,15,3,borde);
    r(9,2,8,1,brillo);r(8,3,11,2,pelo);r(7,5,13,2,pelo);
    r(8,4,3,1,brillo);r(11,3,3,1,brillo);r(16,4,3,2,oscuro);
    r(7,6,5,2,pelo);r(8,8,2,1,oscuro);r(10,6,4,1,brillo);r(12,5,4,1,brillo);
    r(12,6,2,2,pelo);r(14,5,2,2,pelo);r(17,6,3,2,oscuro);r(19,7,1,2,oscuro);
    if(chica){r(7,9,2,8,pelo);r(18,9,2,8,pelo);r(7,12,1,5,brillo);r(19,11,1,7,oscuro);r(8,17,2,2,brillo);r(17,17,2,2,oscuro);r(7,5,2,2,0xdd83aa);r(9,5,1,1,0xffd5e5);}
    if(alex){
      // Caricatura deliberadamente grotesca: entradas, uniceja y sonrisa torcida.
      r(10,3,3,3,piel);r(11,3,2,1,luz);r(15,4,2,2,piel);r(8,3,2,1,oscuro);r(18,2,2,2,oscuro);
      r(7,8,2,4,sombra);r(19,7,2,4,piel);r(19,8,1,2,luz);
      r(9,7,9,1,oscuro);r(11,8,1,1,oscuro);r(15,8,2,1,oscuro);
      r(10,9,2,2,0xe9d6ab);r(11,10,1,1,borde);r(15,9,2,1,0xe9d6ab);r(15,9,1,1,borde);
      r(13,9,2,3,sombra);r(12,10,3,1,luz);r(14,11,2,1,0x9c6a4e);
      r(10,12,7,1,0x67463c);r(11,13,6,1,borde);r(11,12,1,1,0xffedc3);r(14,12,2,1,0xdac491);r(16,12,1,1,0xffedc3);
      r(9,11,1,1,0x805a45);r(17,11,1,1,0x805a45);r(12,14,1,1,0x805a45);r(16,13,1,1,0x805a45);
      r(10,17,1,1,0xb4a46b);r(16,20,2,1,0x5e6248);r(8,21,1,1,0xb4a46b);
    }
    if(moto){
      // Casco abierto, caja de delivery y moto, también píxel a píxel.
      r(8,1,11,1,borde);r(7,2,13,3,0x316b71);r(9,2,8,1,0x83c7c2);r(7,4,13,1,0x254c57);r(7,5,2,3,0x316b71);r(18,5,2,3,0x254c57);
      r(1,15,6,10,borde);r(2,15,4,9,0xb8793c);r(2,16,4,2,0xe9b66c);r(3,18,1,6,0xf4d598);r(4,19,2,3,0xf5e7c9);
      for(const x of [5,20]){r(x-3,27,6,4,borde);r(x-2,26,4,6,borde);r(x-1,28,2,2,0xc2c6c8);r(x-2,27,4,1,0x64767b);}
      r(5,25,16,3,0x28575f);r(7,24,12,3,0x46999b);r(8,24,9,1,0x9bd5cb);r(10,23,7,1,borde);
      r(19,21,1,5,0x8d9b9d);r(17,20,4,1,borde);r(21,22,2,2,0xf0d28f);r(22,22,1,1,0xfff1ce);r(20,18,1,2,0x64767b);r(20,17,3,1,0xc2d3d1);
    }
    g.generateTexture(key,54,64);g.destroy();
    s.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    return key;
  }
  function configurarProta(s,opciones){
    // Conjunto finito de combinaciones: cada textura se genera solo la primera vez.
    claveProta='prota_'+opciones.cabello+'_'+opciones.ojos+'_'+opciones.ropa;
    return personaje(s,'chica',opciones,claveProta);
  }

  function crearTexturas(s){
    personaje(s,'chica');personaje(s,'extra');personaje(s,'Martín');
    personaje(s,'Alexander');personaje(s,'Nicolás');
    if(s.textures.exists('obj_corazon'))return;
    let g=s.make.graphics({x:0,y:0,add:false}),p=pincel(g);
    // Corazón de cristal con borde dorado y facetas brillantes.
    p.el(22,36,29,6,0x995176,.15);
    p.ci(14,15,10,0xc78263);p.ci(29,15,10,0xc78263);p.tr(5,19,38,19,21.5,36,0xc78263);
    p.ci(14,14,8.5,0xf48abb);p.ci(29,14,8.5,0xed72aa);p.tr(6,18,37,18,21.5,33,0xe666a0);
    p.tr(8,18,21,18,21,31,0xffa6ce);p.tr(22,18,36,18,22,31,0xc94e8d);
    p.el(12,11,8,4,0xffe4f2);p.ci(29,9,2,0xffb8dc);estrella(g,34,7,4,0xfff4cf);
    g.generateTexture('obj_corazon',44,42);g.destroy();
    g=s.make.graphics({x:0,y:0,add:false});p=pincel(g);
    p.el(18,40,25,5,0x6d465b,.16);p.ln(10,4,10,39,0x594257,3);p.ln(9,4,9,38,0xe1bcc2,1);
    p.tr(12,6,36,10,12,23,0xaa345e);p.tr(12,5,35,9,12,17,0xf17c95);p.tr(12,17,35,9,26,21,0xd95379);
    p.ln(14,7,28,10,0xffc0cb,1);p.ci(10,3,2.5,0xffd594);estrella(g,23,12,3,0xffe0c1);
    g.generateTexture('obj_bandera',44,44);g.destroy();
  }
  function fondo(s,tema){
    const g=s.add.graphics().setDepth(-3),p=pincel(g);
    g.fillStyle(tema.suelo);g.fillRect(0,0,960,600);
    p.rr(20,101,920,450,22,tema.borde);p.rr(25,106,910,440,18,0xfff9f0);p.rr(31,112,898,428,15,tema.suelo);
    // Baldosas nacaradas con juntas alternadas, sin colisiones.
    for(let row=0,y=118;y<535;y+=36,row++)for(let x=38-(row%2)*26;x<924;x+=52){
      if(x<33)continue;p.rr(x,y,47,30,5,0xffffff);g.fillStyle(tema.suelo,.66);g.fillRoundedRect(x+1,y+1,45,28,4);
      p.ln(x+5,y+2,x+39,y+2,0xffffff,1,.65);
    }
    for(let i=0;i<36;i++){
      const x=43+(i*137)%865,y=121+(i*79)%405;
      p.el(x,y,8,3,tema.planta,.27);p.el(x+3,y-2,3,7,tema.planta,.23);
      if(i%3===0)flor(g,x+5,y-4,2.4,0xffffff);
    }
    for(const [x,y] of [[43,125],[914,125],[43,526],[914,526]]){flor(g,x,y,6,0xffffff);p.ci(x,y,1.6,0xe6b567);}
    return g;
  }
  function jardinera(s,x,y,w,h,color){
    const g=s.add.graphics().setDepth(3),p=pincel(g),left=x-w/2,top=y-h/2;
    p.el(x,y+h*.55,w+13,12,0x6b4865,.14);
    p.rr(left-2,top+3,w+4,h+3,6,0xa97978);p.rr(left-1,top+1,w+2,h,5,0xe3b7a2);
    p.ln(left+4,y+h/2,left+w-4,y+h/2,0xf9ddc6,2);
    p.rr(left+2,top,w-4,h-3,5,0x597863);
    // Hojas superpuestas, nervaduras y ramilletes de distribución fija.
    for(let i=0;i<Math.ceil(w/9);i++){
      const px=left+6+i*8.5,py=top+5+(i%3)*5;
      p.el(px,py+3,14,10,0x638e78);p.el(px-2,py,12,9,color);p.el(px-3,py-2,7,4,0xffffff,.26);
      p.ln(px-4,py+2,px+3,py-1,0x47745c,.65,.65);
    }
    for(let i=0;i<Math.floor(w/23);i++){
      const px=left+13+i*23,py=top+7+(i%2)*7;
      p.ln(px,py+5,px,py-1,0x47745c,1);flor(g,px,py,4.2,i%2?0xfff0da:0xffd6e8);
    }
    // El rectángulo invisible conserva las dimensiones del obstáculo original.
    const cuerpo=s.add.rectangle(x,y,w,h,0xffffff,0).setDepth(2);
    return {dibujo:g,cuerpo};
  }
  function corazon(s,x,y){
    const aro=s.add.circle(x,y,20,0xf9c3d9,.3).setStrokeStyle(1,0xffffff,.8).setDepth(5);
    const icono=s.add.image(x,y,'obj_corazon').setDisplaySize(35,34).setDepth(6);
    const pulso=s.tweens.add({targets:aro,scaleX:1.13,scaleY:1.13,alpha:.65,duration:1100,yoyo:true,repeat:-1});
    const flotar=s.tweens.add({targets:icono,y:y-3,duration:1000,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    aro.once('destroy',()=>pulso.remove());icono.once('destroy',()=>flotar.remove());
    return {x,y,aro,icono,tomada:false};
  }
  function salida(s,x,y){
    const halo=s.add.circle(x,y,37,0xffbad5,.2).setDepth(5);
    const puerta=s.add.graphics().setDepth(6);
    const simbolo=s.add.graphics().setDepth(7);
    const objeto={x,y,halo,puerta,simbolo,active:true,abierto:null,destroy(){halo.destroy();puerta.destroy();simbolo.destroy();this.active=false;}};
    actualizarSalida(objeto,false);return objeto;
  }
  function actualizarSalida(o,abierto){
    if(o.abierto===abierto)return;o.abierto=abierto;
    const g=o.puerta.clear(),p=pincel(g),x=o.x,y=o.y;
    p.el(x,y+36,76,13,0x735470,.15);
    p.rr(x-33,y-38,66,76,18,0x9d7b8f);p.rr(x-30,y-40,60,75,17,abierto?0xb8ddbf:0xdcc9d7);
    p.rr(x-25,y-35,50,67,14,abierto?0x478c75:0x8c7d99);p.rr(x-21,y-31,42,60,11,abierto?0x73c9a1:0xb8a3be);
    p.rr(x-17,y-26,34,26,9,abierto?0xc8f5d6:0xe0d3e4);p.ln(x,-26+y,x,-1+y,0xfff2da,2);p.ln(x-16,y-12,x+16,y-12,0xfff2da,2);
    p.rr(x-16,y+6,32,18,3,abierto?0x5ca78b:0x9e88ab);p.ci(x+13,y+3,2.5,0xffdf9c);p.ci(x+12.5,y+2.5,.9,0xfff5d2);
    p.rr(x-36,y+32,72,5,2,0xe6c6b3);p.rr(x-40,y+37,80,4,2,0xf7dfc8);
    for(const side of [-1,1]){p.ln(x+side*29,y+20,x+side*29,y-19,0x69967b,2);for(let i=0;i<4;i++){p.el(x+side*31,y+13-i*9,9,5,0x8ebc91);if(i%2===0)flor(g,x+side*30,y+8-i*10,3,0xffe3e7);}}
    const sym=o.simbolo.clear(),q=pincel(sym);
    if(abierto){estrella(sym,x,y+13,5,0xfff1bb);estrella(sym,x-36,y-24,4,0xfff5d1);estrella(sym,x+33,y-35,5,0xfff5d1);}
    else{sym.lineStyle(2,0xffe9bb);sym.strokeRoundedRect(x-5,y+5,10,11,5);q.rr(x-7,y+11,14,11,3,0xe4b46e);q.ci(x,y+15,1.6,0x795566);q.ln(x,y+16,x,y+19,0x795566,1.5);}
    o.halo.setFillStyle(abierto?0xa7ffc8:0xffbad5,abierto?.34:.2);
  }
  function bandera(s,x,y){return s.add.image(x,y,'obj_bandera').setDisplaySize(36,36).setDepth(15);}
  function foto(s,x,y){
    const c=s.add.container(x,y).setDepth(35),g=s.add.graphics(),p=pincel(g);
    p.rr(-77,-62,160,140,8,0x6b4966);p.rr(-81,-67,160,140,8,0xfffbf4);p.rr(-72,-58,142,100,4,0xf3c7d8);
    for(let i=0;i<12;i++)p.ci(-65+(i*43)%129,-49+(i*19)%82,2,0xffffff,.45);
    c.add(g);
    c.add(s.add.image(-24,0,'personaje_Martín').setScale(1.25));c.add(s.add.image(21,0,'personaje_extra').setScale(1.25).setFlipX(true));
    const frente=s.add.graphics();estrella(frente,53,-39,7,0xfff4cd);flor(frente,-59,56,5,0xf2a0bf);c.add(frente);
    c.add(s.add.text(0,-39,'♥',{fontSize:'23px',color:'#dc397b'}).setOrigin(.5));
    c.add(s.add.text(0,55,'Martín y una chica',{fontFamily:'Arial',fontSize:'13px',color:'#915873'}).setOrigin(.5));
    c.setAngle(-5);return c;
  }
  return {crearTexturas,configurarProta,get claveProta(){return claveProta;},fondo,jardinera,corazon,salida,actualizarSalida,bandera,foto};
})();
