// Generated by CoffeeScript 1.9.3
(function() {
  var $button, $pauseString, $playString, J, MAX_POINTS, Quaternion, Vector, camera, centerMassHeight, controls, cos, degree, getDerivative, gyroG, gyroL, gyroMass, height, initModels, line, lsum, max_nutation, model, nutation, nutationDot, omega, pi, plot, plotData, precession, precessionDot, pushButton, ref, ref1, ref2, renderer, resetStartingConditions, rotation, rotationDot, scene, simulationState, sin, startSimulation, startTime, stepRungeKutta, stopSimulation, toEuler, updateInitialConditions, viewportId, width;
  lsum = function(vec1, vec2, k1) {
    if (k1 == null) {
      k1 = 1;
    }
    return vec1.map(function(e, i) {
      return vec1[i] * k1 + vec2[i];
    });
  };
  stepRungeKutta = function(vec, func, t, dt) {
    var k1, k2, k3, k4;
    k1 = func(t, vec);
    k2 = func(t + dt / 2, lsum(k1, vec, dt / 2));
    k3 = func(t + dt / 2, lsum(k2, vec, dt / 2));
    k4 = func(t + dt, lsum(k3, vec, dt));
    return vec.map(function(e, i) {
      return e + dt * ((k1[i] + k4[i]) / 6 + (k2[i] + k3[i]) / 3);
    });
  };
  getDerivative = function(t, arg, m, g, l) {
    var A, C, Mx, My, Mz, denom, ex, ey, ez, p, q, quatd, r, ref, w, x, y, z;
    w = arg[0], x = arg[1], y = arg[2], z = arg[3], p = arg[4], q = arg[5], r = arg[6];
    if (m == null) {
      m = 1;
    }
    if (g == null) {
      g = 1;
    }
    if (l == null) {
      l = 1;
    }
    ref = [J.A, J.C], A = ref[0], C = ref[1];
    ex = l * 2 * (-w * y + x * z);
    ey = l * 2 * (w * x + y * z);
    ez = l * w * w - x * w - y * y + z * z;
    denom = A / m + ex * ex + ey * ey;
    Mx = g * ey - (p * p + q * q) * ey * ez + r * ((2 - C / A) * ex * (q * ex - p * ey) + q * (A - C) / m + q * (ey * ey - ex * ex) + 2 * p * ex * ey);
    My = -g * ex + (p * p + q * q) * ex * ez + r * ((2 - C / A) * ey * (q * ex - p * ey) - p * (A - C) / m + p * (ey * ey - ex * ex) - 2 * q * ex * ey);
    Mz = 0;
    quatd = [(-p * x - q * y - r * z) / 2.0, (p * w + r * y - q * z) / 2.0, (q * w - r * x + p * z) / 2.0, (r * w + q * x - p * y) / 2.0];
    return [quatd[0], quatd[1], quatd[2], quatd[3], Mx / denom, My / denom, Mz / denom];
  };
  pi = Math.PI;
  degree = pi / 180;
  ref = [Math.sin, Math.cos], sin = ref[0], cos = ref[1];
  Quaternion = THREE.Quaternion;
  Vector = THREE.Vector3;
  viewportId = 'viewport';
  ref1 = [350, 300], width = ref1[0], height = ref1[1];
  renderer = controls = void 0;
  scene = camera = model = line = void 0;
  MAX_POINTS = 5000;
  centerMassHeight = 113.8;
  max_nutation = 45 * degree;
  omega = new Vector(0, 0, 5);
  gyroMass = 1;
  gyroG = 10;
  gyroL = 1;
  J = {
    A: 7,
    B: 7,
    C: 10
  };
  ref2 = [J.C - J.B, J.B - J.A, J.A - J.C], J.CB = ref2[0], J.BA = ref2[1], J.AC = ref2[2];
  plot = void 0;
  plotData = {
    theta: {
      data: [[0, 0]],
      label: "<span id='theta'>$\\theta = 0.00000$</span>",
      color: 1
    },
    psi: {
      data: [[0, 0]],
      label: "<span id='psi'>$\\psi = 0.00000$</span>",
      color: 0
    },
    phi: {
      data: [[0, 0]],
      label: "<span id='phi'>$\\varphi = 0.00000$</span>",
      color: 3
    },
    phidot: {
      data: [[0, 0]],
      label: "<span id='phidot'>$\\dot\\varphi = 0.00000$</span>",
      color: 2
    }
  };
  simulationState = false;
  startTime = 0;
  resetStartingConditions = true;
  precession = {
    id: 'precession',
    value: 60
  };
  nutation = {
    id: 'nutation',
    value: 13
  };
  rotation = {
    id: 'rotation',
    value: 60
  };
  precessionDot = {
    id: 'precession',
    value: -0.53
  };
  nutationDot = {
    id: 'nutation',
    value: 0.45
  };
  rotationDot = {
    id: 'rotation',
    value: 2.82
  };
  $button = $playString = $pauseString = void 0;
  toEuler = function(arg, arg1) {
    var p, phi, phid, psi, q, r, theta, w, x, y, z;
    w = arg[0], x = arg[1], y = arg[2], z = arg[3];
    p = arg1[0], q = arg1[1], r = arg1[2];
    theta = Math.acos(w * w - x * x - y * y + z * z);
    psi = Math.atan2(w * y + x * z, w * x - y * z);
    if (psi < 0) {
      psi += 2 * pi;
    }
    phi = -psi + Math.atan2(2 * w * z, w * w - z * z);
    while (!(phi > 0)) {
      phi += 2 * pi;
    }
    phid = r - (p * Math.sin(phi) + q * Math.cos(phi)) / Math.tan(theta);
    return [psi, theta, phi, phid];
  };
  updateInitialConditions = function() {
    var f, nutAngle, phi, phiAngle, phid, phidot, psi, psiAngle, psid, q, ref3, theta, thetad, w, x, y, z;
    psi = precession.value * degree;
    theta = nutation.value * degree;
    phi = rotation.value * degree;
    psid = precessionDot.value;
    thetad = nutationDot.value;
    phid = rotationDot.value;
    omega.x = psid * sin(theta) * sin(phi) + thetad * cos(phi);
    omega.y = psid * sin(theta) * cos(phi) - thetad * sin(phi);
    omega.z = psid * cos(theta) + phid;
    q = new Quaternion();
    f = function(x, y, z, a) {
      return new Quaternion().setFromAxisAngle(new Vector(x, y, z), a);
    };
    q.multiply(f(0, 0, 1, psi));
    q.multiply(f(1, 0, 0, theta));
    q.multiply(f(0, 0, 1, phi));
    model.quaternion.copy(q);
    model.position.z = Math.cos(theta) * centerMassHeight;
    ref3 = [q.w, q.x, q.y, q.z], w = ref3[0], x = ref3[1], y = ref3[2], z = ref3[3];
    psiAngle = Math.atan2(w * y + x * z, w * x - y * z);
    if (psiAngle < 0) {
      psiAngle += 2 * pi;
    }
    nutAngle = Math.acos(w * w - x * x - y * y + z * z);
    phiAngle = Math.atan2(2 * w * z, w * w - z * z) - psiAngle;
    while (!(phiAngle > 0)) {
      phiAngle += 2 * pi;
    }
    return phidot = omega.z - (omega.x * Math.sin(phiAngle) + omega.y * Math.cos(phiAngle)) / Math.tan(nutAngle);
  };
  initModels = function(webglContext) {
    var gyroMaterial, loader;
    if (webglContext == null) {
      webglContext = true;
    }
    gyroMaterial = new THREE.MeshPhongMaterial({
      specular: '#AFD8F8',
      color: '#AFD8F8',
      emissive: '#132116',
      shininess: 100000
    });
    if (!webglContext) {
      gyroMaterial.overdraw = 1.0;
      planeMaterial.overdraw = 1.0;
    }
    model = new THREE.Group();
    loader = new THREE.OBJLoader();
    loader.load('gyro.obj', function(object) {
      object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          return child.material = gyroMaterial;
        }
      });
      object.rotation.x = pi / 2;
      object.scale.set(14, 14, 14);
      object.position.z += 113.8;
      object.position.z -= centerMassHeight;
      model.add(object);
      return scene.add(model);
    });
    (function() {
      var geometry, material, plane;
      geometry = new THREE.PlaneGeometry(300, 300, 32);
      material = new THREE.MeshBasicMaterial({
        color: 0xE0E0E0,
        side: THREE.DoubleSide
      });
      plane = new THREE.Mesh(geometry, material);
      return scene.add(plane);
    })();
    return (function() {
      var geometry, material, positions;
      geometry = new THREE.BufferGeometry();
      positions = new Float32Array(MAX_POINTS * 3);
      geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.attributes.position.len = 0;
      geometry.setDrawRange(0, 0);
      material = new THREE.LineBasicMaterial({
        color: 0xCB4B4B,
        linewidth: 2
      });
      line = new THREE.Line(geometry, material);
      return scene.add(line);
    })();
  };
  pushButton = function(state) {
    if (state === true) {
      $playString.hide();
      return $pauseString.show();
    } else {
      $pauseString.hide();
      return $playString.show();
    }
  };
  startSimulation = function() {
    var k, results, v;
    simulationState = true;
    pushButton(true);
    startTime = (new Date).getTime();
    $('#alert-notification').hide();
    line.geometry.setDrawRange(0, 0);
    line.geometry.attributes.position.len = 0;
    results = [];
    for (k in plotData) {
      v = plotData[k];
      results.push(v.data = []);
    }
    return results;
  };
  stopSimulation = function() {
    simulationState = false;
    return pushButton(false);
  };
  return $(function() {
    var animate, channel, init, initCamera, lastTime, nutData, plotDataArray, plotInit, plotLegend, plotOptions, plotRedrawAxes, plotRedrawLegend, render, state, timeElement;
    startTime = (new Date).getTime();
    plot = void 0;
    plotOptions = void 0;
    plotDataArray = [];
    plotLegend = void 0;
    nutData = [];
    timeElement = void 0;
    lastTime = 0;
    state = {
      'selectedObjects': {
        'cylinder': false,
        'cube': false
      }
    };
    channel = void 0;
    plotRedrawLegend = function() {
      var key, plotLegendClone, results, series;
      plotLegendClone = plotLegend.clone();
      $("#plot-placeholder .legend").replaceWith(plotLegendClone);
      timeElement = plotLegendClone.find("span#time span.digits");
      results = [];
      for (key in plotData) {
        series = plotData[key];
        results.push(series.legendElement = plotLegendClone.find("span#" + key + " span.digits"));
      }
      return results;
    };
    plotRedrawAxes = function(redraw) {
      if (redraw == null) {
        redraw = false;
      }
      plotOptions.xaxis.min = plotOptions.yaxis.min = 0;
      plotOptions.xaxis.max = 10;
      plotOptions.yaxis.max = 30;
      plotDataArray.map(function(data) {
        return data.data.map(function(arg) {
          var x, y;
          x = arg[0], y = arg[1];
          if (x < plotOptions.xaxis.min) {
            plotOptions.xaxis.min = Math.floor(x);
            redraw = true;
          }
          if (x > plotOptions.xaxis.max) {
            plotOptions.xaxis.max = Math.ceil(x);
            redraw = true;
          }
          if (y < plotOptions.yaxis.min) {
            plotOptions.yaxis.min = 30.0 * Math.floor(y / 30.0);
            redraw = true;
          }
          if (y > plotOptions.yaxis.max) {
            plotOptions.yaxis.max = 30.0 * Math.ceil(y / 30.0);
            return redraw = true;
          }
        });
      });
      if (redraw) {
        plot = $.plot('#plot-placeholder', plotDataArray, plotOptions);
        if (plotLegend) {
          return plotRedrawLegend();
        }
      }
    };
    plotInit = function() {
      var latestPosition, updateLegend, updateLegendTimeout;
      plotDataArray = [plotData.psi, plotData.theta, plotData.phi, plotData.phidot];
      plotOptions = {
        legend: {
          show: true
        },
        series: {
          lines: {
            show: true
          },
          points: {
            show: false
          }
        },
        xaxis: {
          min: 0,
          max: 2
        },
        yaxis: {
          ticks: 10,
          min: 0,
          max: 30
        },
        selection: {
          mode: "xy"
        },
        zoom: {
          interactive: true
        },
        pan: {
          interactive: false
        },
        crosshair: {
          mode: "x"
        },
        grid: {
          hoverable: true,
          autoHighlight: false
        },
        hooks: {
          bindEvents: [
            function(p, eHolder) {
              return eHolder.dblclick(function() {
                return plot = $.plot("#plot-placeholder", startData, options);
              });
            }
          ],
          draw: [
            function(p, context) {
              if (!plotLegend) {
                plotLegend = $('#plot-placeholder .legend').clone();
                plotLegend.find('table').css({
                  right: '30px'
                }).prepend("<tr>\n  <td></td>\n  <td><span id=\"time\">$t=0.00000$</span></td>\n</tr>");
                plotLegend.children('div').css({
                  height: '98px',
                  width: '114px'
                });
                return MathJax.Hub.Queue(["Typeset", MathJax.Hub, plotLegend.get()[0]], function() {
                  var key, results, series;
                  plotLegend.find("span#time span.mn:contains('0.00000')").addClass('digits');
                  results = [];
                  for (key in plotData) {
                    series = plotData[key];
                    results.push(plotLegend.find("span#" + key + " span.mn:contains('0.00000')").addClass('digits'));
                  }
                  return results;
                });
              }
            }
          ]
        }
      };
      plotRedrawAxes(true);
      $("#plot-placeholder").bind("plotselected", function(event, ranges) {
        if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
          ranges.xaxis.to = ranges.xaxis.from + 0.00001;
        }
        if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
          ranges.yaxis.to = ranges.yaxis.from + 0.00001;
        }
        plot = $.plot("#plot-placeholder", plotDataArray, $.extend(true, {}, plotOptions, {
          xaxis: {
            min: ranges.xaxis.from,
            max: ranges.xaxis.to
          },
          yaxis: {
            min: ranges.yaxis.from,
            max: ranges.yaxis.to
          }
        }));
        return plotRedrawLegend();
      });
      updateLegendTimeout = latestPosition = null;
      updateLegend = function() {
        var axes, i, j, key, p1, p2, pos, ref3, ref4, ref5, series, x, y;
        updateLegendTimeout = null;
        pos = latestPosition;
        axes = plot.getAxes();
        if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
          return;
        }
        x = 0;
        for (key in plotData) {
          series = plotData[key];
          if (!series.data) {
            break;
          }
          if (series.data.length === 0) {
            break;
          }
          if (pos.x < series.data[0][0]) {
            ref3 = series.data[0], x = ref3[0], y = ref3[1];
          } else if (pos.x > series.data[series.data.length - 1][0]) {
            ref4 = series.data[series.data.length - 1], x = ref4[0], y = ref4[1];
          } else {
            for (i = j = 0, ref5 = series.data.length; 0 <= ref5 ? j < ref5 : j > ref5; i = 0 <= ref5 ? ++j : --j) {
              if (series.data[i][0] > pos.x) {
                break;
              }
            }
            p1 = series.data[i - 1];
            p2 = series.data[i];
            x = pos.x;
            y = p1[1] + (p2[1] - p1[1]) * (x - p1[0]) / (p2[0] - p1[0]);
          }
          series.legendElement.text(y.toFixed(4));
        }
        return timeElement.text(x.toFixed(4));
      };
      return $("#plot-placeholder").bind("plothover", function(event, pos, item) {
        latestPosition = pos;
        if (!updateLegendTimeout) {
          return updateLegendTimeout = setTimeout(updateLegend, 50);
        }
      });
    };
    initCamera = function(camera) {
      camera.position.x = 400;
      camera.position.y = 400;
      camera.position.z = 200;
      camera.up.set(0, 0, 1);
      camera.lookAt(new THREE.Vector3(0, 0, 200));
      return camera.updateProjectionMatrix();
    };
    init = function() {
      var ambientLight, container, contextNames, directionalLight, e, heightSegments, i, radiusSegments, testCanvas, webglContext;
      container = document.getElementById(viewportId);
      testCanvas = document.createElement('canvas');
      webglContext = null;
      contextNames = ['experimental-webgl', 'webgl', 'moz-webgl', 'webkit-3d'];
      radiusSegments = void 0;
      heightSegments = void 0;
      i = 0;
      while (i < contextNames.length) {
        try {
          webglContext = testCanvas.getContext(contextNames[i]);
          if (webglContext) {
            break;
          }
        } catch (_error) {
          e = _error;
        }
        i++;
      }
      if (webglContext) {
        renderer = new THREE.WebGLRenderer({
          antialias: true
        });
        radiusSegments = 50;
        heightSegments = 50;
      } else {
        renderer = new THREE.CanvasRenderer;
        radiusSegments = 10;
        heightSegments = 10;
      }
      renderer.setSize(width, height);
      renderer.setClearColor(0xFFFFFF, 1);
      container.appendChild(renderer.domElement);
      scene = new THREE.Scene;
      camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
      initCamera(camera);
      controls = new THREE.TrackballControls(camera, container);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.noZoom = false;
      controls.noPan = false;
      controls.staticMoving = true;
      controls.dynamicDampingFactor = 0.3;
      controls.keys = [65, 83, 68];
      controls.addEventListener('change', render);
      initModels(webglContext);
      ambientLight = new THREE.AmbientLight(0x222222);
      scene.add(ambientLight);
      directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(1, 1, 1).normalize();
      scene.add(directionalLight);
      $button = $('button.play');
      $button.click(function(el) {
        if (simulationState === true) {
          return stopSimulation();
        } else {
          return startSimulation();
        }
      });
      $playString = $('span#play');
      $pauseString = $('span#pause');
      $('button.info').click(function() {
        return $('#info').toggle();
      });
      $('.close-btn').click(function() {
        return $('#info').hide();
      });
      $('button.reset').click(function() {
        var k, v;
        line.geometry.setDrawRange(0, 0);
        line.geometry.attributes.position.len = 0;
        for (k in plotData) {
          v = plotData[k];
          v.data = [];
        }
        return updateInitialConditions();
      });
      $('button.default-view').click(function() {
        return initCamera(camera);
      });
      [precession, nutation, rotation].map(function(s) {
        return s.slider = $('#' + s.id + ' .knob').CircularSlider({
          radius: 50,
          animate: false,
          value: s.value,
          shape: s.id === 'nutation' ? 'Half Circle' : 'Full Circle Right',
          max: s.id === 'nutation' ? 179 : void 0,
          clockwise: false,
          slide: function(ui, value) {
            s.value = value;
            return updateInitialConditions();
          }
        });
      });
      [precessionDot, nutationDot, rotationDot].map(function(s) {
        var $el;
        $el = $('#' + s.id + ' .der-input');
        $el.val(s.value.toFixed(3));
        return $el.on('change', function(el) {
          s.value = parseFloat($el.val());
          return updateInitialConditions();
        });
      });
      updateInitialConditions();
      plotInit();
      render();
      animate();
    };
    animate = function() {
      requestAnimationFrame(animate);
      controls.update();
      render();
    };
    render = function() {
      var dt, i, p, phi, phid, pos, proj, psi, q, r, ref3, ref4, t, theta, time, vert, w, x, y, z;
      time = (new Date).getTime();
      t = (time - startTime) / 1000.0;
      if (t > 1000) {
        stopSimulation();
      }
      dt = (time - lastTime) / 1000;
      if (simulationState) {
        ref3 = stepRungeKutta([model.quaternion.w, model.quaternion.x, model.quaternion.y, model.quaternion.z, omega.x, omega.y, omega.z], (function(t, v) {
          return getDerivative(t, v, gyroMass, gyroG, gyroL);
        }), time, dt), w = ref3[0], x = ref3[1], y = ref3[2], z = ref3[3], p = ref3[4], q = ref3[5], r = ref3[6];
        omega.fromArray([p, q, r]);
        model.quaternion.fromArray([x, y, z, w]).normalize();
        ref4 = toEuler([w, x, y, z], [p, q, r]), psi = ref4[0], theta = ref4[1], phi = ref4[2], phid = ref4[3];
        model.position.z = centerMassHeight * Math.cos(theta);
        proj = centerMassHeight * Math.sin(theta);
        vert = [-proj * Math.sin(psi), proj * Math.cos(psi), 0];
        pos = line.geometry.attributes.position;
        plotData.theta.data.push([t, theta / degree]);
        plotData.psi.data.push([t, psi / degree]);
        plotData.phi.data.push([t, phi / degree]);
        plotData.phidot.data.push([t, phid]);
        plot.setData(plotDataArray);
        plotRedrawAxes();
        plot.draw();
        if (pos.len < MAX_POINTS) {
          i = pos.len;
          pos.array[3 * i + 0] = vert[0];
          pos.array[3 * i + 1] = vert[1];
          pos.array[3 * i + 2] = vert[2];
          pos.len += 1;
          line.geometry.setDrawRange(0, i + 1);
          line.geometry.attributes.position.needsUpdate = true;
        } else {
          stopSimulation();
        }
        if (theta > max_nutation) {
          stopSimulation();
          $('#alert-notification').show();
        }
      }
      lastTime = time;
      renderer.render(scene, camera);
    };
    return init();
  });
})();
