$(document).ready(function() {
  $('#tablabels > li').click(function(){
    var target = $(this).attr("target")
    $("#tabcontents > li").addClass("hidden");
    $('#'+target).removeClass("hidden")
    $("#tablabels > li").removeClass("selectedtab")
    $(this).addClass('selectedtab')
  })
});
