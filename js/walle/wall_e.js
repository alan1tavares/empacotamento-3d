var scene, camera, renderer, transformControls, orbitControls;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var objetos = []; // lista de objetos a ser selcionado
var objetoSelecionado;

'use strict';

// Configure physi
Physijs.scripts.worker = 'js/three_physi/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function init() {
  // Criar scene
  scene = new Physijs.Scene();

  // Criar camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(15, 15, 30);
  camera.lookAt(scene.position);

  // Criar renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xEEEEEE);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Criar eixos
  var axes = new THREE.AxisHelper(20);
  scene.add(axes);

  // Definir saida do webGL
  document.getElementById("saidaWebGL").appendChild(renderer.domElement);

  // Controle dos objetos
  transformControls = new THREE.TransformControls(camera, renderer.domElement);
  transformControls.setMode("translate");
  transformControls.addEventListener('change', render);
  scene.add(transformControls);

  // Controle da scene
  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

  criarObjetos();

  eventos();
}

// Colocar as chamadas de eventos aqui
function eventos() {

  renderer.domElement.addEventListener('mousedown', eMouseDown);
  renderer.domElement.addEventListener('mouseup', eMouseUp);

}

function animate() {

  scene.simulate();
  transformControls.update();
  orbitControls.update();
  render();

  requestAnimationFrame(animate);
}

function render() {
  renderer.render(scene, camera);
}

// Colocar todos objetos nessa funcao
function criarObjetos() {

  var material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });
  objetos.push(criarCubo(5, 10, 10, 1, 1, 1, material));

  material = new THREE.MeshBasicMaterial({
    color: 0xff0000
  });
  objetos.push(criarCubo(5, 5, 5, 1, 1, 1, material));

  material = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  });
  objetos.push(criarCubo(3, 2, 1, 2, 2, 2, material));

  // Crair chao
  material = new THREE.MeshBasicMaterial({
    opacity: 0.5,
    color: 0x44ff44,
    transparent: true
  });

  criarContainner(5, 0.1, 5, 3, 5, 5, material);

  // Chao
  material = new THREE.MeshBasicMaterial({
    color: 0x918b82
  });
  criarCubo(5, 0, 5, 10, 0.1, 15, material).mass = 0;
}

// Cria um cubo
// x,y, z: coordenadas
// largura, atura, profundidade: tamanho
// cor: a cor em hexadecimal
function criarCubo(x, y, z, largura, altura, profundidade, material) {
  var cubo = new Physijs.BoxMesh(

    new THREE.BoxGeometry(largura, altura, profundidade), // Geotmetria
    material
  );

  // Posicao do cubo
  cubo.position.set(x, y, z);
  scene.add(cubo);

  return cubo;
}

// Cria um containner
// x,y, z: coordenadas
// largura, atura, profundidade: tamanho
// cor: a cor em hexadecimal
function criarContainner(x, y, z, largura, altura, profundidade, material) {

  // Lado inferiror
  var chao = criarCubo(0, 0, 0, largura, 0.1, profundidade, material);
  chao.mass = 0;

  //Lado esquerdo
  var ladoEsquerdo = criarCubo(-largura / 2, altura / 2, 0, 0.1, altura, profundidade, material);
  ladoEsquerdo.mass = 0;

  // Lado direito
  var ladoDireito = criarCubo(largura / 2, altura / 2, 0, 0.1, altura, profundidade, material);
  ladoDireito.mass = 0;

  // Lado detras
  var ladoDetras = criarCubo(0, altura / 2, -profundidade / 2, largura, altura, 0.1, material);
  ladoDetras.mass = 0;

  // Lado da frente
  var ladoDaFrente = criarCubo(0, altura / 2, profundidade / 2, largura, altura, 0.1, material);
  ladoDaFrente.mass = 0;

  chao.add(ladoEsquerdo);
  chao.add(ladoDireito);
  chao.add(ladoDetras);
  chao.add(ladoDaFrente);

  chao.position.set(x, y, z);

  chao.material.opacity = 0.5;
  chao.material.transparent = true;

  scene.add(chao);
}

// Adiciona uma caixa na scene
function addCaixa(largura, altura, profundidade, cor) {
  var material = new THREE.MeshBasicMaterial({
    color: cor
  });

  objetos.push(criarCubo(6, 1, 6, largura, altura, profundidade, material));
}

// Adiciona um container na scene
function addContainer(largura, altura, profundidade, cor){
  var material = new THREE.MeshBasicMaterial({
    opacity: 0.5,
    color: cor,
    transparent: true
  });

  criarContainner(5, 0.1, 5, largura, altura, profundidade, material);
}

// Funcao para tirar a fisica do objeto
function tirarFisicaDo(pObjeto) {

  var v = new THREE.Vector3(0, 0, 0);

  pObjeto.setAngularFactor(v);
  pObjeto.setAngularVelocity(v);
  pObjeto.setLinearFactor(v);
  pObjeto.setLinearVelocity(v);

}

// Funcao para botar a fisica no objeto
function botarFisicaNo(pObjeto) {
  if (pObjeto !== null) {
    var v = new THREE.Vector3(1, 1, 1);
    pObjeto.setAngularFactor(v);
    pObjeto.setLinearFactor(v);
  }
}

function eMouseDown(event) {

  // Se clicou com o botão esquerdo
  if (event.button === 0) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objetos);

    // Se algum objeto for clicado, selecione ele
    if (intersects.length > 0 && transformControls.get_intersect() == false) {

      if (objetoSelecionado != intersects.length.object) {
        transformControls.detach();
        botarFisicaNo(objetoSelecionado);
      }

      objetoSelecionado = intersects[0].object;

      // Configurar o objeto TransformControls
      transformControls.attach(intersects[0].object);
      transformControls.visible = true;

      // Configurar o objeto selecionado
      objetoSelecionado.__dirtyPosition = true;
      tirarFisicaDo(objetoSelecionado);

    }

    // Se os objetjos de TransformControl nao for selecionado, desselecionar o objeto
    else if (transformControls.get_intersect() == false) {
      transformControls.detach();
      botarFisicaNo(objetoSelecionado);
    }
  }
}

function eMouseUp(event) {

}

init();
animate();