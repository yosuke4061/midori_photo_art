document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('webgl-canvas');
    const startButton = document.getElementById('startButton');
    const isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);

    const renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF); // 背景色を黒に設定

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 100); 
    

    addGridHelper(scene);
    const sphere = addSphere(scene); // 球体を追加し、参照を保持
    addImage(scene);
    

    setupControls(canvas, camera, isMobile);

    startButton.addEventListener('click', () => {
        animate();
        addCubeParticles(scene, camera, renderer);
        addBambooForest(scene);
        startButton.style.display = 'none';
    });

    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.y += 0.01; // 球体を回転させる
        renderer.render(scene, camera);
    }

    
});

function addCubeParticles(scene, camera, renderer) {
    const particleCount = 100; // パーティクルの数を100に設定
    const cubeSize = 5; // 立方体のサイズ
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 緑色でマテリアルを作成
    const cubes = []; // 立方体を格納する配列
    const velocities = []; // 各立方体の速度を格納する配列

    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = Math.random() * 400 - 200;
        cube.position.y = Math.random() * 400 - 200;
        cube.position.z = Math.random() * 400 - 200;
        scene.add(cube);
        cubes.push(cube);

        // 各立方体にランダムな速度を割り当て
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2, // X方向の速度
            (Math.random() - 0.5) * 2, // Y方向の速度
            (Math.random() - 0.5) * 2  // Z方向の速度
        );
        velocities.push(velocity);
    }

    // アニメーション関数を定義
    function animate() {
        requestAnimationFrame(animate);

        // 各立方体の位置を更新
        cubes.forEach((cube, index) => {
            cube.position.add(velocities[index]);
        });

        renderer.render(scene, camera);
    }

    animate(); // アニメーションを開始
}
function addGridHelper(scene) {
    //const gridHelper = new THREE.GridHelper(100, 100);
    //scene.add(gridHelper);
}

function addBambooForest(scene) {
    const particleCount = 1000; // パーティクルの数
    const bambooColor = 0x6B8E23; // 竹の色
    const particles = new THREE.BufferGeometry();
    const positions = [];
    const velocities = []; // 速度を格納する配列

    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * 500 - 250; // ランダムなX座標
        const y = Math.random() * 500 - 250; // ランダムなY座標
        const z = Math.random() * 500 - 250; // ランダムなZ座標
        positions.push(x, y, z);

        // 速度ベクトルをランダムに生成
        const vx = (Math.random() - 0.5) * 2;
        const vy = (Math.random() - 0.5) * 2;
        const vz = (Math.random() - 0.5) * 2;
        velocities.push(new THREE.Vector3(vx, vy, vz));
    }

    particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: bambooColor,
        size: 5,
        map: new THREE.TextureLoader().load('pic02.png'), // 葉のテクスチャ
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // アニメーション関数を追加
    function animateBamboo() {
        requestAnimationFrame(animateBamboo);
        const positions = particles.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i / 3].x;
            positions[i + 1] += velocities[i / 3].y;
            positions[i + 2] += velocities[i / 3].z;

            // 境界条件の処理
            if (positions[i] < -250 || positions[i] > 250) velocities[i / 3].x *= -1;
            if (positions[i + 1] < -250 || positions[i + 1] > 250) velocities[i / 3].y *= -1;
            if (positions[i + 2] < -250 || positions[i + 2] > 250) velocities[i / 3].z *= -1;
        }

        particles.attributes.position.needsUpdate = true; // 位置情報を更新
    }

    animateBamboo(); // アニメーションを開始
}



function addSphere(scene) {
    const geometry = new THREE.SphereGeometry(5, 32, 32); // サイズを大きくする
    const material = new THREE.MeshBasicMaterial({color: 0x50C878, wireframe: true});
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    return sphere;
}

function addImage(scene) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('20181110-DSC00675.jpg', function(texture) {
        const geometry = new THREE.PlaneGeometry(5, 3);
        const material = new THREE.MeshBasicMaterial({map: texture});
        const imageMesh = new THREE.Mesh(geometry, material);
        imageMesh.position.set(0, 0, -1); // 画像の位置調整
        scene.add(imageMesh);

        const outlineMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.BackSide});
        const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
        outlineMesh.scale.multiplyScalar(1.1); // 枠を少し大きくする
        scene.add(outlineMesh);
    });
}

function setupControls(canvas, camera, isMobile) {
    let lastX, lastY, isDragging = false, rotateMode = false;
    const maxRotation = Math.PI / 4; // 45度をラジアンに変換
    const minZoom = 5; // ズームの最小値
    const maxZoom = 15; // ズームの最大値を調整

    canvas.addEventListener('dblclick', () => {
        rotateMode = !rotateMode; // ダブルクリックで回転モードの切り替え
    });

    const startDragging = (event) => {
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
    };

    const drag = (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;

        if (rotateMode) {
            const rotationSpeed = 0.005;
            camera.rotation.y -= deltaX * rotationSpeed;
            camera.rotation.x -= deltaY * rotationSpeed;
        } else {
            camera.position.x -= deltaX * 0.01;
            camera.position.y += deltaY * 0.01;
        }

        lastX = event.clientX;
        lastY = event.clientY;
    };

    const endDragging = () => {
        isDragging = false;
    };

    const zoom = (deltaY) => {
        const zoomIntensity = 0.5; // ズームの強度を調整
        let targetZ = camera.position.z - deltaY * zoomIntensity; // deltaYの符号を調整
        targetZ = Math.max(minZoom, Math.min(maxZoom, targetZ)); // ズームの上限と下限を設定して制限する
        smoothZoom(camera.position.z, targetZ, camera);
    };

    if (isMobile) {
        // モバイルデバイス用のイベントリスナー
        canvas.addEventListener('touchstart', (event) => startDragging(event.touches[0]));
        canvas.addEventListener('touchmove', (event) => drag(event.touches[0]));
        canvas.addEventListener('touchend', endDragging);
    } else {
        // PC用のイベントリスナー
        canvas.addEventListener('mousedown', startDragging);
        canvas.addEventListener('mousemove', drag);
        canvas.addEventListener('mouseup', endDragging);
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault(); // スクロールのデフォルト動作を防止
            zoom(event.deltaY); // deltaYの値に応じてズーム方向と強度を調整
        });
    }
}

function smoothZoom(startZ, endZ, camera) {
    const duration = 500; // ズームの持続時間を2000ミリ秒（2秒）に延長
    const startTime = performance.now();

    function zoomStep(timestamp) {
        const elapsed = timestamp - startTime;
        const fraction = Math.min(elapsed / duration, 1);
        // イージング関数を改善してより滑らかに
        const easeInOutCubic = fraction < 0.5 ? 4 * fraction * fraction * fraction : 1 - Math.pow(-2 * fraction + 2, 3) / 2;
        camera.position.z = startZ + (endZ - startZ) * easeInOutCubic;

        if (fraction < 1) {
            requestAnimationFrame(zoomStep);
        } else {
            camera.position.z = endZ; // 最終的な位置を確定
        }
    }

    requestAnimationFrame(zoomStep);
}