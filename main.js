import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 纹理管理器类
class TextureManager {
    constructor() {
        this.loader = new THREE.TextureLoader();
        this.fallbackTextures = {};
        this.loadingProgress = {};
    }
    
    // 更新加载进度显示
    updateLoadingProgress(message) {
        const progressElement = document.getElementById('loading-progress');
        if (progressElement) {
            progressElement.textContent = message;
        }
        console.log(message);
    }
    
    // 异步加载纹理，失败时使用后备纹理
    async loadTexture(url, fallbackGenerator, name = '') {
        const displayName = name || url.split('/').pop();
        this.updateLoadingProgress(`正在加载 ${displayName}...`);
        
        return new Promise((resolve) => {
            this.loader.load(
                url,
                (texture) => {
                    console.log(`Successfully loaded texture: ${url}`);
                    this.updateLoadingProgress(`✓ ${displayName} 加载成功`);
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                },
                (progress) => {
                    if (progress.total > 0) {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        this.updateLoadingProgress(`加载 ${displayName}: ${percent}%`);
                    }
                },
                (error) => {
                    console.warn(`Failed to load texture ${url}, using fallback`, error);
                    this.updateLoadingProgress(`⚠ ${displayName} 加载失败，使用备用纹理`);
                    const fallbackTexture = fallbackGenerator();
                    resolve(fallbackTexture);
                }
            );
        });
    }
    
    // 创建后备地球纹理
    createFallbackEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // 创建地球表面（深海蓝色）
        context.fillStyle = '#0f4c75';
        context.fillRect(0, 0, 512, 512);
        
        // 添加更逼真的大陆形状
        context.fillStyle = '#2d5016';
        // 模拟大陆板块
        const continents = [
            { x: 80, y: 150, w: 120, h: 80 },   // 非洲
            { x: 150, y: 100, w: 180, h: 100 }, // 亚洲
            { x: 50, y: 200, w: 100, h: 120 },  // 南美洲
            { x: 30, y: 80, w: 80, h: 100 },    // 北美洲
            { x: 250, y: 300, w: 60, h: 40 },   // 澳洲
            { x: 200, y: 350, w: 80, h: 30 }    // 南极洲
        ];
        
        continents.forEach(continent => {
            context.beginPath();
            context.ellipse(continent.x, continent.y, continent.w/2, continent.h/2, 
                          Math.random() * Math.PI, 0, Math.PI * 2);
            context.fill();
            
            // 添加山脉细节
            context.fillStyle = '#1a3d0a';
            for (let i = 0; i < 5; i++) {
                const mx = continent.x + (Math.random() - 0.5) * continent.w * 0.5;
                const my = continent.y + (Math.random() - 0.5) * continent.h * 0.5;
                context.beginPath();
                context.arc(mx, my, Math.random() * 8 + 3, 0, Math.PI * 2);
                context.fill();
            }
            context.fillStyle = '#2d5016';
        });
        
        // 添加海洋深浅变化
        context.fillStyle = 'rgba(15, 76, 117, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 20 + 5;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
        
        // 添加更逼真的云层
        context.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 25 + 8;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
        
        // 添加极地冰盖
        context.fillStyle = 'rgba(240, 248, 255, 0.8)';
        // 北极
        context.beginPath();
        context.arc(256, 50, 40, 0, Math.PI * 2);
        context.fill();
        // 南极
        context.beginPath();
        context.arc(256, 462, 35, 0, Math.PI * 2);
        context.fill();
        
        return new THREE.CanvasTexture(canvas);
    }
    
    // 创建后备月球纹理
    createFallbackMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // 月球基色（更逼真的月球色调）
        context.fillStyle = '#c8c8c8';
        context.fillRect(0, 0, 256, 256);
        
        // 添加月海（暗色区域）
        context.fillStyle = '#a0a0a0';
        const maria = [
            { x: 60, y: 80, r: 25 },   // 静海
            { x: 120, y: 60, r: 20 },  // 危海
            { x: 180, y: 100, r: 30 }, // 风暴洋
            { x: 80, y: 150, r: 18 },  // 雨海
            { x: 150, y: 180, r: 22 }  // 澄海
        ];
        
        maria.forEach(mare => {
            context.beginPath();
            context.arc(mare.x, mare.y, mare.r, 0, Math.PI * 2);
            context.fill();
        });
        
        // 添加大型陨石坑
        context.fillStyle = '#909090';
        const largeCraters = [
            { x: 200, y: 50, r: 15 },
            { x: 40, y: 200, r: 12 },
            { x: 180, y: 200, r: 18 },
            { x: 30, y: 60, r: 10 }
        ];
        
        largeCraters.forEach(crater => {
            context.beginPath();
            context.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
            context.fill();
            
            // 添加撞击坑边缘
            context.strokeStyle = '#b0b0b0';
            context.lineWidth = 2;
            context.stroke();
        });
        
        // 添加小型陨石坑（增加密度）
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = Math.random() * 6 + 1;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(144, 144, 144, ${Math.random() * 0.6 + 0.4})`;
            context.fill();
        }
        
        // 添加射纹（明亮的辐射纹）
        context.strokeStyle = 'rgba(220, 220, 220, 0.3)';
        context.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const centerX = Math.random() * 256;
            const centerY = Math.random() * 256;
            const angle = Math.random() * Math.PI * 2;
            const length = Math.random() * 50 + 20;
            
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(
                centerX + Math.cos(angle) * length,
                centerY + Math.sin(angle) * length
            );
            context.stroke();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
}

class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 纹理管理器
        this.textureManager = new TextureManager();
        
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
    
    async init() {
        this.textureManager.updateLoadingProgress('正在初始化场景...');
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLights();
        
        this.textureManager.updateLoadingProgress('正在创建星空背景...');
        this.createStarField();
        
        // 异步创建太阳系
        await this.createSolarSystem();
        
        // 完成加载
        this.textureManager.updateLoadingProgress('✓ 太阳系加载完成！');
        
        this.setupEventListeners();
        this.animate();
        
        // 隐藏加载界面，显示控制界面
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('ui-controls').style.display = 'block';
            document.getElementById('info-panel').style.display = 'block';
        }, 1500);
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
        // 太阳光源（增强光照强度和对比度）
        const sunLight = new THREE.PointLight(0xffffff, 4, 2000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 1000;
        sunLight.shadow.bias = -0.0001;
        this.scene.add(sunLight);
        
        // 环境光（降低强度以增加对比度）
        const ambientLight = new THREE.AmbientLight(0x202040, 0.15);
        this.scene.add(ambientLight);
        
        // 添加方向光补充照明（模拟反射光）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
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
    
    async createSolarSystem() {
        // 创建太阳
        await this.createSun();
        
        // 创建地球轨道系统
        await this.createEarthSystem();
        
        // 创建月球轨道系统
        await this.createMoonSystem();
    }
    
    async createSun() {
        const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: await this.createSunTexture(),
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // 添加太阳光环效果
        this.createSunGlow();
    }
    
    async createSunTexture() {
        // 尝试加载真实的太阳纹理，失败时使用程序生成的纹理
        return await this.textureManager.loadTexture(
            './textures/sun_2k.jpg',
            () => {
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
            },
            'Sun Texture'
        );
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
    
    async createEarthSystem() {
        // 创建地球轨道容器
        this.earthOrbit = new THREE.Group();
        this.scene.add(this.earthOrbit);
        
        // 创建地球（提高几何体质量）
        const earthGeometry = new THREE.SphereGeometry(3, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: await this.createEarthTexture(),
            bumpMap: this.createEarthBumpTexture(),
            bumpScale: 0.05,
            normalMap: this.createEarthNormalTexture(),
            normalScale: new THREE.Vector2(0.5, 0.5),
            shininess: 5,
            specular: 0x111111,
            emissive: 0x000408,
            emissiveIntensity: 0.08
        });
        
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.position.set(60, 0, 0);
        
        // 添加地球的23.5度轴倾斜
        this.earth.rotation.z = THREE.MathUtils.degToRad(23.5);
        
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earthOrbit.add(this.earth);
        
        // 创建地球大气层
        this.createAtmosphere();
        
        // 创建地球轨道线
        this.createOrbitLine(60, 0x4444ff);
    }
    
    async createEarthTexture() {
        // 尝试加载本地和在线的地球纹理
        const earthTextureUrls = [
            // 本地高质量地球图像
            './textures/earth_8k.jpg',
            // 备用在线URL
            'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
            // NASA Blue Marble URL
            'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg'
        ];
        
        // 尝试加载第一个URL，失败时尝试其他URL
        for (const url of earthTextureUrls) {
            try {
                const texture = await this.textureManager.loadTexture(url, () => this.textureManager.createFallbackEarthTexture(), 'Earth Texture');
                console.log(`Successfully loaded Earth texture from: ${url}`);
                return texture;
            } catch (error) {
                console.warn(`Failed to load earth texture from ${url}:`, error);
                continue;
            }
        }
        
        // 如果所有URL都失败，使用后备纹理
        console.warn('All earth texture URLs failed, using fallback texture');
        return this.textureManager.createFallbackEarthTexture();
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
    
    createEarthNormalTexture() {
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
        // 创建主大气层
        const atmosphereGeometry = new THREE.SphereGeometry(3.1, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide,
            depthWrite: false
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.earth.add(atmosphere);
        
        // 创建外层大气辉光
        const glowGeometry = new THREE.SphereGeometry(3.25, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4da6ff,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
            depthWrite: false
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.earth.add(glow);
    }
    
    async createMoonSystem() {
        // 创建月球轨道容器（相对于地球）
        this.moonOrbit = new THREE.Group();
        this.earth.add(this.moonOrbit);
        
        // 创建月球（提高几何体质量）
        const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({
            map: await this.createMoonTexture(),
            bumpMap: this.createMoonBumpTexture(),
            bumpScale: 0.08,
            shininess: 1,
            specular: 0x222222,
            emissive: 0x080808,
            emissiveIntensity: 0.05
        });
        
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moon.position.set(10, 0, 0);
        this.moon.castShadow = true;
        this.moon.receiveShadow = true;
        this.moonOrbit.add(this.moon);
        
        // 创建月球轨道线（相对于地球）
        this.createMoonOrbitLine();
    }
    
    async createMoonTexture() {
        // 尝试加载本地和在线的月球纹理
        const moonTextureUrls = [
            // 本地高质量月球图像
            './textures/moon_4k.jpg',
            // 备用在线URL
            'https://www.solarsystemscope.com/textures/download/2k_moon.jpg',
            // NASA LRO 月球图像
            'https://nasa3d.arc.nasa.gov/shared_assets/images/lis/moon/lro_color_poles_4k.jpg'
        ];
        
        for (const url of moonTextureUrls) {
            try {
                const texture = await this.textureManager.loadTexture(url, () => this.textureManager.createFallbackMoonTexture(), 'Moon Texture');
                console.log(`Successfully loaded Moon texture from: ${url}`);
                return texture;
            } catch (error) {
                console.warn(`Failed to load moon texture from ${url}:`, error);
                continue;
            }
        }
        
        // 如果所有URL都失败，使用后备纹理
        console.warn('All moon texture URLs failed, using fallback texture');
        return this.textureManager.createFallbackMoonTexture();
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
                this.controls.minDistance = 5;
                this.controls.maxDistance = 500;
                break;
            case 'earth':
                const earthWorldPos = new THREE.Vector3();
                this.earth.getWorldPosition(earthWorldPos);
                // 确保相机距离足够，避免进入地球内部
                const earthOffset = new THREE.Vector3(12, 6, 12);
                targetPosition = earthWorldPos.clone().add(earthOffset);
                targetLookAt = earthWorldPos.clone();
                this.controls.minDistance = 8;
                this.controls.maxDistance = 50;
                break;
            case 'moon':
                const moonWorldPos = new THREE.Vector3();
                this.moon.getWorldPosition(moonWorldPos);
                // 确保相机距离足够，避免进入月球内部
                const moonOffset = new THREE.Vector3(4, 2, 4);
                targetPosition = moonWorldPos.clone().add(moonOffset);
                targetLookAt = moonWorldPos.clone();
                this.controls.minDistance = 3;
                this.controls.maxDistance = 20;
                break;
            case 'sun':
                targetPosition = new THREE.Vector3(20, 8, 20);
                targetLookAt = new THREE.Vector3(0, 0, 0);
                this.controls.minDistance = 15;
                this.controls.maxDistance = 100;
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