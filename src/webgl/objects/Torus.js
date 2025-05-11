import * as THREE from "three";
import audioController from "../../utils/AudioController";

export default class SpectrumTorus {
  constructor() {
    this.group = new THREE.Group();
    this.rotationSpeed = 0.01;
    
    this.geometry = new THREE.TorusGeometry(8, 3, 64, 128);
    this.material = new THREE.MeshPhongMaterial({
      color: 0x8f00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.group.add(this.mesh);

    this.createInnerParticles();
  }

  createInnerParticles() {
    this.particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(512 * 3);
    
    for(let i = 0; i < 512; i++) {
      const angle = (i / 512) * Math.PI * 2;
      const radius = 5 + Math.random() * 3;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    this.particleGeometry.setAttribute(
      'position', 
      new THREE.BufferAttribute(positions, 3)
    );

    this.particles = new THREE.Points(
      this.particleGeometry,
      new THREE.PointsMaterial({
        size: 0.2,
        color: 0xffffff,
        transparent: true
      })
    );
    
    this.group.add(this.particles);
  }

  update() {
    this.group.rotation.x += this.rotationSpeed * 0.5;
    this.group.rotation.y += this.rotationSpeed;

    const vertices = this.geometry.attributes.position.array;
    
    for(let i = 0; i < vertices.length; i += 3) {
      const frequency = audioController.fdata[(i/3) % 256] / 255;
      vertices[i + 2] = Math.sin(Date.now() * 0.001 + i) * frequency * 3;
    }

    this.geometry.attributes.position.needsUpdate = true;
    
    const particlePositions = this.particleGeometry.attributes.position.array;
    
    for(let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i + 2] += Math.sin(Date.now() * 0.001 + i) * 0.05;
    }
    
    this.particleGeometry.attributes.position.needsUpdate = true;
  }
}