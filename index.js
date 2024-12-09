import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow maps
document.body.appendChild(renderer.domElement);

// Create the composer for post-processing effects
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85 // Bloom strength, radius, and threshold
);
composer.addPass(bloomPass);

// Cube position (light source)
const cubePosition = new THREE.Vector3(0, 0, 0);

// Movement variables
const movementSpeed = 0.5;
const keyStates = {};

// Event listeners for key controls
document.addEventListener('keydown', (event) => {
    keyStates[event.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (event) => {
    keyStates[event.key.toLowerCase()] = false;
});

// Function to handle movement
function handleMovement(cubeMesh) {
    if (keyStates['w']) {
        cubePosition.y += movementSpeed;
    }
    if (keyStates['s']) {
        cubePosition.y -= movementSpeed;
    }
    if (keyStates['a']) {
        camera.position.x -= movementSpeed;
    }
    if (keyStates['d']) {
        camera.position.x += movementSpeed;
    }
    // Sync cubeMesh position with cubePosition
    cubeMesh.position.copy(cubePosition);
}

// Load Font
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    // Alphabet ShaderMaterial
    const alphabetGeometry = new TextGeometry('A', {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
    });

    const alphabetMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 lightPosition;
            uniform vec3 ambientColor;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform float specularIntensity;
            uniform float shininess;

            void main() {
                vec3 ambient = ambientColor * ambientIntensity;
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diffuseColor * diff;
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = vec3(specularIntensity) * spec;

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
        uniforms: {
            lightPosition: { value: cubePosition },
            ambientColor: { value: new THREE.Color(0xB0E0E6) },
            ambientIntensity: { value: 0.520 },
            diffuseColor: { value: new THREE.Color(0xB0E0E6) },
            specularIntensity: { value: 0.5 },
            shininess: { value: 30.0 },
        },
    });

    const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
    alphabetMesh.position.set(-8, 0, 0);
    alphabetMesh.castShadow = true;
    scene.add(alphabetMesh);

    // Digit ShaderMaterial
    const digitGeometry = new TextGeometry('0', {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
    });

    const digitMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 lightPosition;
            uniform vec3 ambientColor;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform float specularIntensity;
            uniform float shininess;

            void main() {
                vec3 ambient = ambientColor * ambientIntensity;
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diffuseColor * diff;
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = spec * specularIntensity * diffuseColor;

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
        uniforms: {
            lightPosition: { value: cubePosition },
            ambientColor: { value: new THREE.Color(0xe6b6b0) },
            ambientIntensity: { value: 0.520 },
            diffuseColor: { value: new THREE.Color(0xe6b6b0) },
            specularIntensity: { value: 0.8 },
            shininess: { value: 80.0 },
        },
    });

    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.set(2, 0, 0);
    digitMesh.castShadow = true;
    scene.add(digitMesh);

    // Glowing Cube (Light Source)
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.copy(cubePosition); // Initialize position
    cubeMesh.castShadow = true;
    scene.add(cubeMesh);

    // Add Point Light at the cube's position
    const pointLight = new THREE.PointLight(0xffffff, 2, 10);
    pointLight.position.copy(cubePosition); // Initialize light position
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Add a helper for the light
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);

    // Ground plane for shadows
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -5;
    plane.receiveShadow = true;
    scene.add(plane);

    function animate() {
        handleMovement(cubeMesh); // Update cube position
        pointLight.position.copy(cubePosition); // Sync light position
        requestAnimationFrame(animate);
        composer.render();
    }

    animate();
});
