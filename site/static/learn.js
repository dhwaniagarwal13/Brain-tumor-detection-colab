// Softmax lab: move the raw scores (logits) and watch the probabilities respond.
(function () {
  var root = document.getElementById("softmax-lab");
  if (!root) return;
  var names = ["Glioma", "Healthy", "Meningioma", "Pituitary Macroadenoma"];
  var start = [2.2, 0.4, 1.6, -0.5];
  var sliders = Array.prototype.slice.call(root.querySelectorAll("input[data-i]"));
  var temp = root.querySelector("#temp");
  var outs = root.querySelectorAll("[data-out]");
  var vals = root.querySelectorAll("output[data-val]");
  var tval = root.querySelector("#temp-val");
  var verdict = root.querySelector("#lab-verdict");

  function update() {
    var T = Number(temp.value);
    var z = sliders.map(function (s) { return Number(s.value) / T; });
    var m = Math.max.apply(null, z);
    var e = z.map(function (v) { return Math.exp(v - m); });
    var sum = e.reduce(function (a, b) { return a + b; }, 0);
    var p = e.map(function (v) { return v / sum; });
    var top = 0;
    p.forEach(function (v, i) {
      outs[i].querySelector("span").style.width = (v * 100).toFixed(1) + "%";
      outs[i].parentNode.querySelector("output").textContent = (v * 100).toFixed(1) + "%";
      if (v > p[top]) top = i;
    });
    vals.forEach(function (o, i) { o.textContent = Number(sliders[i].value).toFixed(1); });
    tval.textContent = T.toFixed(1);
    verdict.textContent = names[top] + " at " + (p[top] * 100).toFixed(1) + "% confidence. " +
      (p[top] < 0.6 ? "A spread this flat means the model is unsure." : p[top] > 0.9 ? "Very confident, but confident is not the same as correct." : "Moderately confident.");
  }

  sliders.forEach(function (s, i) { s.value = String(start[i]); s.addEventListener("input", update); });
  temp.addEventListener("input", update);
  update();
})();
