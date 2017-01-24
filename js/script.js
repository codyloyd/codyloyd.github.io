//nav stuff
const nav = document.querySelector(".nav")
const topOfNav = nav.offsetTop;

function fixNav(){
  if (window.scrollY >= topOfNav){
    document.body.style.paddingTop = nav.offsetHeight + 50 + 'px';
    nav.classList.add('fixed-nav');
  } else {
    document.body.style.paddingTop = 0;
    nav.classList.remove('fixed-nav');
  }
}
window.addEventListener('scroll',fixNav)

//projects thing

const projects = document.querySelectorAll(".project-list > a")
const slider = document.querySelector(".project-slider")
function highlightProject(e) {
  e.preventDefault();
  const projectCoords = this.getBoundingClientRect();
        const coords = {
        width: projectCoords.width,
        height: projectCoords.height,
        top: projectCoords.top + window.scrollY,
        left: projectCoords.left + window.scrollX,
      }
  slider.style.transform = `translate(${coords.left}px, ${coords.top - 110}px)`
  console.log(coords)
}

projects.forEach(p => p.addEventListener('click', highlightProject))
