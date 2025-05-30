import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 天体对象
        this.sun = null;
        this.earth = null;
        this.moon = null;
        this.earthOrbit = null;
        this.moonOrbit = null;
        
        // 动画控制
        this.animationSpeed = 1;
        this.isAnimating = true;
        this.clock = new THREE.Clock();
        
        // 视角状态
        this.currentView = 'space';
        this.savedCameraPosition = new THREE.Vector3();
        this.savedCameraTarget = new THREE.Vector3();
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLights();
        this.createStarField();
        this.createSolarSystem();
        this.setupEventListeners();
        this.animate();
        
        // 隐藏加载界面，显示控制界面
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('ui-controls').style.display = 'block';
            document.getElementById('info-panel').style.display = 'block';
        }, 1000);
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 50, 100);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(this.renderer.domElement);
    }
    
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 500;
        this.controls.minDistance = 5;
    }
    
    createLights() {
        // 太阳光源
        const sunLight = new THREE.PointLight(0xffffff, 3, 2000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 1000;
        this.scene.add(sunLight);
        
        // 环境光（增强亮度）
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // 添加方向光补充照明
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
    }
    
    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 1,
            sizeAttenuation: false
        });
        
        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
        
        // 创建星云效果
        this.createNebula();
    }
    
    createNebula() {
        const nebulaGeometry = new THREE.SphereGeometry(800, 32, 32);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            map: this.createNebulaTexture(),
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        this.scene.add(nebula);
    }
    
    createNebulaTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // 创建渐变星云背景
        const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0.8)');
        gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.4)');
        gradient.addColorStop(1, 'rgba(25, 25, 112, 0.1)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        // 添加一些随机的亮点
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 3;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
            context.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createSolarSystem() {
        // 创建太阳
        this.createSun();
        
        // 创建地球轨道系统
        this.createEarthSystem();
        
        // 创建月球轨道系统
        this.createMoonSystem();
    }
    
    createSun() {
        const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: this.createSunTexture(),
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // 添加太阳光环效果
        this.createSunGlow();
    }
    
    createSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // 创建太阳表面纹理
        const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.3, '#ff8800');
        gradient.addColorStop(0.6, '#ff4400');
        gradient.addColorStop(1, '#cc2200');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);
        
        // 添加表面细节
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = Math.random() * 10 + 2;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${Math.random() * 0.5})`;
            context.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createSunGlow() {
        const glowGeometry = new THREE.SphereGeometry(12, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);
    }
    
    createEarthSystem() {
        // 创建地球轨道容器
        this.earthOrbit = new THREE.Group();
        this.scene.add(this.earthOrbit);
        
        // 创建地球
        const earthGeometry = new THREE.SphereGeometry(3, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: this.createEarthTexture(),
            bumpMap: this.createEarthBumpTexture(),
            bumpScale: 0.1,
            shininess: 1,
            emissive: 0x001122,
            emissiveIntensity: 0.1
        });
        
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.position.set(60, 0, 0);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earthOrbit.add(this.earth);
        
        // 创建地球大气层
        this.createAtmosphere();
        
        // 创建地球轨道线
        this.createOrbitLine(60, 0x4444ff);
    }
    
    createEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // 创建地球表面
        context.fillStyle = '#0066cc';
        context.fillRect(0, 0, 256, 256);
        
        // 添加大陆
        context.fillStyle = '#228B22';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const width = Math.random() * 50 + 20;
            const height = Math.random() * 30 + 15;
            
            context.beginPath();
            context.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            context.fill();
        }
        
        // 添加云层
        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = Math.random() * 15 + 5;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createEarthBumpTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#888888';
        context.fillRect(0, 0, 256, 256);
        
        // 添加地形高度信息
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = Math.random() * 10;
            const brightness = Math.random() * 100 + 100;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
            context.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(3.2, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.earth.add(atmosphere);
    }
    
    createMoonSystem() {
        // 创建月球轨道容器（相对于地球）
        this.moonOrbit = new THREE.Group();
        this.earth.add(this.moonOrbit);
        
        // 创建月球
        const moonGeometry = new THREE.SphereGeometry(1, 16, 16);
        const moonMaterial = new THREE.MeshPhongMaterial({
            map: this.createMoonTexture(),
            bumpMap: this.createMoonBumpTexture(),
            bumpScale: 0.1
        });
        
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moon.position.set(10, 0, 0);
        this.moon.castShadow = true;
        this.moon.receiveShadow = true;
        this.moonOrbit.add(this.moon);
        
        // 创建月球轨道线（相对于地球）
        this.createMoonOrbitLine();
    }
    
    createMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        // 月球基色
        context.fillStyle = '#cccccc';
        context.fillRect(0, 0, 128, 128);
        
        // 添加陨石坑
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const radius = Math.random() * 8 + 2;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(150, 150, 150, ${Math.random() * 0.5 + 0.3})`;
            context.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createMoonBumpTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#808080';
        context.fillRect(0, 0, 128, 128);
        
        // 添加月球表面细节
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const radius = Math.random() * 5;
            const brightness = Math.random() * 100 + 50;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
            context.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createOrbitLine(radius, color) {
        const points = [];
        const segments = 64;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.3 
        });
        
        const orbitLine = new THREE.Line(geometry, material);
        this.scene.add(orbitLine);
    }
    
    createMoonOrbitLine() {
        const points = [];
        const segments = 32;
        const radius = 10;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xaaaaaa, 
            transparent: true, 
            opacity: 0.2 
        });
        
        const orbitLine = new THREE.Line(geometry, material);
        this.earth.add(orbitLine);
    }
    
    setupEventListeners() {
        // 视角切换按钮
        document.getElementById('view-space').addEventListener('click', () => this.setView('space'));
        document.getElementById('view-earth').addEventListener('click', () => this.setView('earth'));
        document.getElementById('view-moon').addEventListener('click', () => this.setView('moon'));
        document.getElementById('view-sun').addEventListener('click', () => this.setView('sun'));
        
        // 动画控制
        document.getElementById('toggle-animation').addEventListener('click', () => this.toggleAnimation());
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        
        // 速度控制
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = this.animationSpeed.toFixed(1) + 'x';
        });
        
        // 窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setView(viewType) {
        const buttons = document.querySelectorAll('#ui-controls button');
        buttons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view-${viewType}`).classList.add('active');
        
        this.currentView = viewType;
        document.getElementById('current-view').textContent = this.getViewName(viewType);
        
        let targetPosition, targetLookAt;
        
        switch (viewType) {
            case 'space':
                targetPosition = new THREE.Vector3(0, 50, 100);
                targetLookAt = new THREE.Vector3(0, 0, 0);
                break;
            case 'earth':
                const earthWorldPos = new THREE.Vector3();
                this.earth.getWorldPosition(earthWorldPos);
                targetPosition = earthWorldPos.clone().add(new THREE.Vector3(15, 5, 15));
                targetLookAt = earthWorldPos;
                break;
            case 'moon':
                const moonWorldPos = new THREE.Vector3();
                this.moon.getWorldPosition(moonWorldPos);
                targetPosition = moonWorldPos.clone().add(new THREE.Vector3(5, 2, 5));
                targetLookAt = moonWorldPos;
                break;
            case 'sun':
                targetPosition = new THREE.Vector3(25, 10, 25);
                targetLookAt = new THREE.Vector3(0, 0, 0);
                break;
        }
        
        this.animateCamera(targetPosition, targetLookAt);
    }
    
    getViewName(viewType) {
        const names = {
            'space': '宇宙视角',
            'earth': '地球视角',
            'moon': '月球视角',
            'sun': '太阳视角'
        };
        return names[viewType] || '未知视角';
    }
    
    animateCamera(targetPosition, targetLookAt, duration = 2000) {
        const startPosition = this.camera.position.clone();
        const startLookAt = this.controls.target.clone();
        const startTime = Date.now();
        
        const animateStep = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.controls.target.lerpVectors(startLookAt, targetLookAt, easeProgress);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animateStep);
            }
        };
        
        animateStep();
    }
    
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const button = document.getElementById('toggle-animation');
        button.textContent = this.isAnimating ? '暂停' : '播放';
    }
    
    resetView() {
        this.setView('space');
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isAnimating) {
            const deltaTime = this.clock.getDelta() * this.animationSpeed;
            
            // 地球公转
            this.earthOrbit.rotation.y += deltaTime * 0.2;
            
            // 地球自转
            this.earth.rotation.y += deltaTime * 2;
            
            // 月球公转
            this.moonOrbit.rotation.y += deltaTime * 1;
            
            // 月球自转
            this.moon.rotation.y += deltaTime * 1;
            
            // 太阳自转
            this.sun.rotation.y += deltaTime * 0.5;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 初始化应用
new SolarSystem(); 