import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AfterViewInit, Component, ElementRef, ViewChild, ViewRef } from '@angular/core';
import * as THREE from "three"
import { BoxBufferGeometry, Mesh, MeshBasicMaterial, PlaneBufferGeometry, RawShaderMaterial, Vector3 } from 'three';
import { Superplane } from "./plane";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import f2 from "!raw-loader!./shaders/inst.frag"
import v2 from "!raw-loader!./shaders/inst.vert"
import { Mimic } from "./mimic";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas') private canvasRef!: ElementRef;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  clock = new THREE.Clock();
  controls!: OrbitControls;
   raycaster = new THREE.Raycaster();
   pointer = new THREE.Vector2();
  

  ngAfterViewInit(): void {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xe0e0e0)
    this.camera = new THREE.PerspectiveCamera(50, this.getAspectRatio(), 0.1, 30)
    this.camera.position.set(0, 0, 2)
    this.camera.up.set(0, 0, 1)
    this.camera.lookAt(new Vector3(0, 0, 0.1))
    this.scene.add(this.camera)
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, logarithmicDepthBuffer: true });
    this.renderer.shadowMap.enabled = true
    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target = new THREE.Vector3(0.0, 0.0, 0.1)
    this.controls.enableDamping = true
    this.controls.keyPanSpeed = 30
    this.controls.autoRotateSpeed = 0.4
    this.controls.screenSpacePanning = false
    this.controls.minPolarAngle = 0 //Math.PI / 13.0
    this.controls.maxPolarAngle = Math.PI / 2 // - Math.PI / 15.0
    this.controls.maxDistance = 20
    this.controls.maxZoom = 3

    //const boxgeo = new THREE.BoxBufferGeometry(1, 1,1);
    //const box = new THREE.Mesh(boxgeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }))
    //this.scene.add(box)

    const plane = new Superplane()
    //this.scene.add(plane)
    const planeGeo = new PlaneBufferGeometry(10, 10)
    
    const planeMesh = new THREE.Mesh(planeGeo)
    planeMesh.normalMatrix.invert()
    //planeMesh.position.z+=5
    const sampler = new MeshSurfaceSampler(planeMesh)
      .setWeightAttribute('uv')
      .build();

//    this.scene.add(planeMesh)

    // Create a sine-like wave
    const curve = new THREE.SplineCurve([
      new THREE.Vector2(-10, 0),
      new THREE.Vector2(-5, 5),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(5, -5),
      new THREE.Vector2(10, 0)
    ]);

    const points = curve.getPoints(50);
    //const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the final object to add to the scene
    //const splineObject = new THREE.Line(geometry, material);
    //this.scene.add(splineObject)
    const sampleGeometry = new BoxBufferGeometry(0.1, 0.1, 0.1)
    const sampleMaterial = new MeshBasicMaterial({ color: 0x00ff00 })
    const imesh = new THREE.InstancedMesh(sampleGeometry,sampleMaterial,300)
    const _position = new THREE.Vector3();
    const _matrix = new THREE.Matrix4();
    const positions: number[] = [];
    const offsets: number[] = [];
    const colors: number[] = [];
    const orientationsStart: number[] = [];
    const orientationsEnd: number[] = [];

    const anchors: Vector3[]=[]

    for (let i = 0; i < 1000; i++) {

      sampler.sample(_position);

      _matrix.makeTranslation(_position.x, _position.y, _position.z);

      anchors.push(_position.clone())
      // positions.push(_position.x,_position.y,_position.z)
      imesh.setMatrixAt(i,_matrix)
    }
    imesh.instanceMatrix.needsUpdate=true
    imesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
    //this.scene.add(imesh)

    // MIMIC

    const mimic = new Mimic(anchors)
    this.scene.add(mimic)

    positions.push(0.025, - 0.025, 0);
    positions.push(- 0.025, 0.025, 0);
    positions.push(0, 0, 0.025);

    // instanced attributes
    const vector = new THREE.Vector4();
    const instanceCount=2000
    for (let i = 0; i < instanceCount; i++) {

      // offsets

      offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

      // colors

      colors.push(Math.random(), Math.random(), Math.random(), Math.random());

      // orientation start

      vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      vector.normalize();

      orientationsStart.push(vector.x, vector.y, vector.z, vector.w);

      // orientation end

      vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      vector.normalize();

      orientationsEnd.push(vector.x, vector.y, vector.z, vector.w);

    }

    // set so its initalized for dat.GUI, will be set in first draw otherwise

    const material2 = new THREE.RawShaderMaterial({

      uniforms: {
        'time': { value: 1.0 },
        'sineTime': { value: 1.0 }
      },
      vertexShader: v2,
      fragmentShader: f2,
      side: THREE.DoubleSide,
      transparent: false

    });
    const geometry2 = new THREE.InstancedBufferGeometry();
    geometry2.instanceCount = instanceCount;
    geometry2.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry2.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    geometry2.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
    geometry2.setAttribute('orientationStart', new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4));
    geometry2.setAttribute('orientationEnd', new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4));

    const mesh = new Mesh(geometry2, material2)
    //geometry2.needsUpdate = true;

    //this.scene.add(mesh);

    //    this.effect=effect
    const render = () => {
      const delta = this.clock.getDelta()
      requestAnimationFrame(render.bind(this))
      _matrix.makeTranslation(Math.random(), Math.random(), Math.random());
//      imesh.setMatrixAt(0,_matrix)
 //     imesh.instanceMatrix.needsUpdate=true;
      const time = performance.now();
      const mouseVec=new Vector3()
      const object = mesh //.scene.children[ 0 ] as Mesh;

      object.rotation.y = time * 0.0005;
      (object.material as RawShaderMaterial).uniforms['time'].value = time * 0.005;
      (object.material as RawShaderMaterial).uniforms['sineTime'].value = Math.sin((object.material as RawShaderMaterial).uniforms['time'].value * 0.05);

      if (this.controls)
        this.controls.update()


        this.raycaster.setFromCamera( this.pointer, this.camera );
	// calculate objects intersecting the picking ray
	const intersects = this.raycaster.intersectObject( planeMesh );

	for ( let i = 0; i < intersects.length; i ++ ) {
    
		//((intersects[ i ].object as Mesh).material as MeshBasicMaterial).color.set( 0xff0000 );
    const intersection = intersects[ i ];
    mouseVec.set(intersection.point.x, intersection.point.y, 0.2)
//    console.log(intersection.point)
    mimic.update(mouseVec)

  }


      this.renderer?.render(this.scene!, this.camera!)


      //this.box.rotation.z=(this.clock.getElapsedTime()/10)
      //  this.effect!.render(this.scene!,this.camera)


    }
    render()
    //    document.body.appendChild( effect.domElement );
    //effect.domElement.className="ascii"

    window.addEventListener('resize', this.handleResize, false)
    window.addEventListener( 'pointermove', this.onPointerMove );
    this.handleResize();

  }

  private handleResize = () => {
    const xm = window.innerWidth;
    const ym = window.innerHeight - 4;
    this.camera.aspect = xm / ym;
    this.camera.updateProjectionMatrix()
    //this.renderPipe?.setSize(xm, ym)
    //this.effect.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setSize(xm, ym)
  }

  private onPointerMove = (event: MouseEvent) =>{

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
  
    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
  


  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  public get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

}
