<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  getMaxRegionValue,
  getRegionCentroid,
  qingpuRegionGeos,
  toWorldCoord,
  type QingpuRegionGeo
} from '@/mock/qingpu-map-geo';
import { mapTabs, type MapTab } from '@/mock/cockpit-data';

const props = withDefaults(
  defineProps<{
    regions?: QingpuRegionGeo[];
  }>(),
  {
    regions: () => qingpuRegionGeos
  }
);

const containerRef = ref<HTMLDivElement | null>(null);
const activeTab = ref<MapTab>('街镇');
const activeRegion = ref<QingpuRegionGeo | null>(null);
const hoveredRegion = ref<QingpuRegionGeo | null>(null);

const mapRegions = computed(() => props.regions);
const totalProjects = computed(() => mapRegions.value.reduce((sum, item) => sum + item.value, 0));
const maxValue = computed(() => getMaxRegionValue(mapRegions.value));

let renderer: THREE.WebGLRenderer | null = null;
let labelRenderer: CSS2DRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let animationId = 0;
let resizeObserver: ResizeObserver | null = null;
let raycaster: THREE.Raycaster | null = null;
const pointer = new THREE.Vector2();
let regionMeshes: THREE.Mesh[] = [];
let mapGroup: THREE.Group | null = null;

function toShape(points: [number, number][]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    const { x: px, z: pz } = toWorldCoord(x, y);
    if (index === 0) shape.moveTo(px, pz);
    else shape.lineTo(px, pz);
  });
  return shape;
}

function getRegionColor(value: number) {
  const t = value / maxValue.value;
  return new THREE.Color().lerpColors(
    new THREE.Color(0x0b3d6e),
    new THREE.Color(0x00c8ff),
    Math.min(1, t * 0.85 + 0.15)
  );
}

function createRegionLabel(region: QingpuRegionGeo, height: number) {
  const centroid = getRegionCentroid(region.points);
  const { x, z } = toWorldCoord(centroid.x, centroid.y);

  const el = document.createElement('div');
  el.className = 'map-region-label';
  el.innerHTML = `<span class="map-region-label__name">${region.name}</span><span class="map-region-label__value">${region.value}</span>`;

  const label = new CSS2DObject(el);
  label.position.set(x, height + 0.06, z);
  return label;
}

function buildMap(regions: QingpuRegionGeo[]) {
  if (!scene) return;

  if (mapGroup) {
    scene.remove(mapGroup);
    mapGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });
  }

  mapGroup = new THREE.Group();
  const group = mapGroup;
  regionMeshes = [];

  regions.forEach((region) => {
    const height = 0.12 + (region.value / maxValue.value) * 0.55;
    const shape = toShape(region.points);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 2
    });
    geometry.rotateX(-Math.PI / 2);

    const color = getRegionColor(region.value);
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.25,
      metalness: 0.35,
      roughness: 0.45
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.region = region;
    group.add(mesh);
    regionMeshes.push(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x66e0ff, transparent: true, opacity: 0.85 })
    );
    group.add(edges);

    const top = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({
        color: 0x33ddff,
        transparent: true,
        opacity: 0.18
      })
    );
    top.rotateX(-Math.PI / 2);
    top.position.y = height + 0.03;
    group.add(top);

    group.add(createRegionLabel(region, height));
  });

  scene.add(group);
}

function buildBaseDecor(group: THREE.Group) {
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(6.8, 7.2, 0.2, 64),
    new THREE.MeshStandardMaterial({
      color: 0x061428,
      emissive: 0x003355,
      emissiveIntensity: 0.15,
      metalness: 0.7,
      roughness: 0.5
    })
  );
  plate.position.y = -0.12;
  group.add(plate);

  const grid = new THREE.GridHelper(13, 30, 0x00d4ff, 0x082840);
  grid.position.y = -0.01;
  (grid.material as THREE.Material).opacity = 0.22;
  (grid.material as THREE.Material).transparent = true;
  group.add(grid);

  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.5 + i * 0.4, 0.02, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.18 - i * 0.06 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.05;
    group.add(ring);
  }
}

function initScene() {
  const container = containerRef.value;
  if (!container) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020810, 0.035);

  const w = container.clientWidth;
  const h = container.clientHeight;

  camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
  camera.position.set(0, 8.5, 7.8);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(w, h);
  labelRenderer.domElement.className = 'cockpit-map__labels';
  container.appendChild(labelRenderer.domElement);

  controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 6;
  controls.maxDistance = 14;
  controls.minPolarAngle = Math.PI / 5;
  controls.maxPolarAngle = Math.PI / 2.4;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.target.set(0, 0.2, 0);

  scene.add(new THREE.AmbientLight(0x336699, 1.4));
  const keyLight = new THREE.DirectionalLight(0x88ddff, 1.6);
  keyLight.position.set(4, 10, 6);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x004488, 0.8);
  fillLight.position.set(-6, 4, -4);
  scene.add(fillLight);

  const decor = new THREE.Group();
  buildBaseDecor(decor);
  scene.add(decor);

  buildMap(mapRegions.value);

  raycaster = new THREE.Raycaster();
  labelRenderer.domElement.addEventListener('pointermove', onPointerMove);
  labelRenderer.domElement.addEventListener('click', onClick);

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  animate();
}

function resize() {
  const container = containerRef.value;
  if (!container || !camera || !renderer || !labelRenderer) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}

function onPointerMove(event: PointerEvent) {
  const container = containerRef.value;
  if (!container || !camera || !raycaster) return;

  const rect = container.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(regionMeshes, false)[0];
  hoveredRegion.value = (hit?.object.userData.region as QingpuRegionGeo) ?? null;
  container.style.cursor = hit ? 'pointer' : 'default';
}

function onClick() {
  if (hoveredRegion.value) activeRegion.value = hoveredRegion.value;
}

function animate() {
  animationId = requestAnimationFrame(animate);

  regionMeshes.forEach((mesh) => {
    const region = mesh.userData.region as QingpuRegionGeo;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const active =
      activeRegion.value?.name === region.name || hoveredRegion.value?.name === region.name;
    mat.emissiveIntensity = active ? 0.65 : 0.25;
  });

  controls?.update();
  if (renderer && labelRenderer && scene && camera) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
}

function disposeScene() {
  cancelAnimationFrame(animationId);
  resizeObserver?.disconnect();
  labelRenderer?.domElement.removeEventListener('pointermove', onPointerMove);
  labelRenderer?.domElement.removeEventListener('click', onClick);

  regionMeshes.forEach((m) => {
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
  });

  renderer?.dispose();
  renderer?.domElement.remove();
  labelRenderer?.domElement.remove();

  renderer = null;
  labelRenderer = null;
  scene = null;
  camera = null;
  controls = null;
  regionMeshes = [];
  mapGroup = null;
}

function selectRegion(region: QingpuRegionGeo) {
  activeRegion.value = region;
}

onMounted(initScene);
onUnmounted(disposeScene);

watch(mapRegions, (regions) => buildMap(regions), { deep: true });
</script>

<template>
  <div class="cockpit-map">
    <div ref="containerRef" class="cockpit-map__canvas" />

    <div v-if="activeRegion || hoveredRegion" class="cockpit-map__tooltip">
      <div class="cockpit-map__tooltip-title">{{ (activeRegion || hoveredRegion)?.name }}</div>
      <div class="cockpit-map__tooltip-value">{{ (activeRegion || hoveredRegion)?.value }} 个项目</div>
    </div>

    <div class="cockpit-map__summary">
      <span class="cockpit-map__summary-label">全区项目</span>
      <span class="cockpit-map__summary-value">{{ totalProjects }}</span>
    </div>

    <div class="cockpit-map__tabs">
      <button
        v-for="tab in mapTabs"
        :key="tab"
        type="button"
        class="cockpit-map__tab"
        :class="{ 'cockpit-map__tab--active': activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cockpit-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
}

.cockpit-map__canvas {
  width: 100%;
  height: calc(100% - 36px);
}

.cockpit-map__canvas :deep(canvas) {
  display: block;
  outline: none;
}

.cockpit-map__labels {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  overflow: hidden;
}

.cockpit-map__labels :deep(.map-region-label) {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.3;
  color: #e8f4ff;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  user-select: none;
}

.cockpit-map__labels :deep(.map-region-label__name) {
  white-space: nowrap;
}

.cockpit-map__labels :deep(.map-region-label__value) {
  font-size: 14px;
  font-weight: 700;
  color: #ffd54f;
}

.cockpit-map__tooltip {
  position: absolute;
  top: 10%;
  right: 6%;
  padding: 10px 14px;
  background: rgba(0, 40, 80, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.45);
  border-radius: 4px;
  pointer-events: none;
  backdrop-filter: blur(6px);
}

.cockpit-map__tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: #e8f4ff;
}

.cockpit-map__tooltip-value {
  margin-top: 4px;
  font-size: 12px;
  color: #ffd54f;
}

.cockpit-map__summary {
  position: absolute;
  top: 8%;
  left: 6%;
  text-align: center;
  pointer-events: none;
}

.cockpit-map__summary-label {
  display: block;
  font-size: 12px;
  color: rgba(180, 210, 240, 0.7);
}

.cockpit-map__summary-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffd54f;
  text-shadow: 0 0 16px rgba(255, 213, 79, 0.45);
}

.cockpit-map__tabs {
  position: absolute;
  right: 6%;
  bottom: 0;
  display: flex;
  gap: 6px;
}

.cockpit-map__tab {
  padding: 4px 14px;
  font-size: 12px;
  color: rgba(180, 210, 240, 0.75);
  background: rgba(0, 60, 120, 0.4);
  border: 1px solid rgba(0, 180, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.cockpit-map__tab--active,
.cockpit-map__tab:hover {
  color: #fff;
  background: rgba(0, 120, 220, 0.5);
  border-color: #00d4ff;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.25);
}
</style>
