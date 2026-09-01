function makeQR() {
  // Replace 'yourusername' and 'your-repo-name' with your actual GitHub details
  let baseUrl = "https://zygotebuilder.github.io/report.html";
  
  let params = new URLSearchParams({
    name: user.name,
    age: user.age,
    energy: report.m[0][2],
    sleep: report.m[1][2],
    movement: report.m[2][2],
    mind: report.m[3][2],
    water: report.m[4][2],
    screen: report.m[5][2],
    food: report.m[6][2]
  });

  let dynamicUrl = baseUrl + "?" + params.toString();
  let qrImg = document.getElementById("qr");
  qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + encodeURIComponent(dynamicUrl);
}
