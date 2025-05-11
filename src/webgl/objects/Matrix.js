import * as THREE from "three";
import audioController from "../../utils/AudioController";

export default class AudioReactiveCube {
  constructor() {
    this.group = new THREE.Group();
    this.bpmMultiplier = 1;
    this.lastBeatTime = 0;
    this.targetScale = new THREE.Vector3(1, 1, 1);
    
    this.initCube();
    this.initParticles();
    this.initGui();
  }

  initCube() {
    this.geometry = new THREE.BoxGeometry(2, 2, 2, 16, 16, 16);
    
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x0000ff,
      emissiveIntensity: 0.2,
      wireframe: false
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.set(0.5, 0.5, 0);

    this.wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(this.geometry),
      new THREE.LineBasicMaterial({ color: 0x00ffff })
    );
    this.mesh.add(this.wireframe);

    this.group.add(this.mesh);
  }

  initParticles() {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ffff,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(particles, this.particleMaterial);
    this.group.add(this.particleSystem);
  }

  initGui() {
    if (window.gui) {
      const folder = window.gui.addFolder('Matrix Settings');
      folder.addColor(this.material, 'color');
      folder.addColor(this.material, 'emissive');
      folder.add(this.material, 'emissiveIntensity', 0, 2);
      folder.add(this.material, 'metalness', 0, 1);
      folder.add(this, 'bpmMultiplier', 0.5, 2);
    }
  }

  update(time, deltaTime) {
    if (!audioController.analyserNode) return;

    const frequencyData = audioController.fdata;
    const averageFrequency = frequencyData.reduce((a, b) => a + b) / frequencyData.length;

    if (audioController.bpm) {
      const beatInterval = 60 / (audioController.bpm * this.bpmMultiplier);
      if (time - this.lastBeatTime > beatInterval) {
        this.onBeat();
        this.lastBeatTime = time;
      }
    }

    this.mesh.rotation.x += 0.005 * this.bpmMultiplier;
    this.mesh.rotation.y += 0.005 * this.bpmMultiplier;

    const vertices = this.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i] += (Math.random() - 0.5) * averageFrequency * 0.005;
      vertices[i + 1] += (Math.random() - 0.5) * averageFrequency * 0.005;
      vertices[i + 2] += (Math.random() - 0.5) * averageFrequency * 0.005;
    }
    this.geometry.attributes.position.needsUpdate = true;

    const particlePositions = this.particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i] += Math.sin(time + i) * 0.01 * averageFrequency;
      particlePositions[i + 1] += Math.cos(time + i) * 0.01 * averageFrequency;
    }
    this.particleSystem.geometry.attributes.position.needsUpdate = true;

    this.mesh.scale.lerp(this.targetScale, 0.1);
  }

  onBeat() {
    this.targetScale.set(
      1 + Math.random() * 0.5,
      1 + Math.random() * 0.5,
      1 + Math.random() * 0.5
    );

    this.material.color.setHSL(Math.random(), 0.8, 0.5);
    this.material.emissive.setHSL(Math.random(), 1, 0.2);
    
    this.material.emissiveIntensity = 1;
    setTimeout(() => {
      this.material.emissiveIntensity = 0.2;
    }, 50);
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.group.remove(this.mesh);
  }
}