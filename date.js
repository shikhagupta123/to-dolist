
exports = getDate;
function getDate() {
  console.log("hey there");
  var today = new Date();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
   var day = today.toLocaleDateString("en-US",options);
   return day;
}
