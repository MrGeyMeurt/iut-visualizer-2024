import * as THREE from "three";
import audioController from "../../utils/AudioController";

export default class Particles {
  constructor() {
    this.group = new THREE.Group();
    this.particleCount = 512;
    this.positions = new Float32Array(this.particleCount * 3);
    this.scales = new Float32Array(this.particleCount);

    // Création de la géométrie avec buffer pour meilleures performances
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 0.5,
      color: 0x8f00ff,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Positionnement aléatoire des particules
    for(let i = 0; i < this.particleCount; i++) {
      this.positions[i * 3] = (Math.random() - 0.5) * 20;
      this.positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('scale', new THREE.BufferAttribute(this.scales, 1));

    this.particles = new THREE.Points(this.geometry, this.material);
    this.group.add(this.particles);
  }

  update() {
    const positions = this.geometry.attributes.position.array;
    const scales = this.geometry.attributes.scale.array;

    for(let i = 0; i < this.particleCount; i++) {
      // Réaction aux fréquences audio
      const frequency = audioController.fdata[i % 256] / 255;
      
      // Animation des positions
      positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      positions[i * 3 + 2] += Math.cos(Date.now() * 0.001 + i) * 0.01;
      
      // Échelle dynamique
      scales[i] = frequency * 2;
      
      // Changement de couleur progressive
      this.material.color.lerp(
        new THREE.Color().setHSL(frequency, 0.8, 0.5), 
        0.1
      );
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.scale.needsUpdate = true;
  }
}