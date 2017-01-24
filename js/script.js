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

//link scrolling
navLinks = document.querySelectorAll('.nav > a')
navLinks.forEach(l => l.addEventListener('click', handleNavClick))
function handleNavClick(e) {
  e.preventDefault();
  const section = document.querySelector(`.${this.dataset.link}`)
  const top = section.getBoundingClientRect().top + window.scrollY;
  console.log(top)
  window.scrollTo(0,top-90);
  // document.querySelector(`.${this.dataset.link}`).scrollIntoView({ 
  //   behavior: 'smooth' 
  // });
}

//projects thing

const projects = document.querySelectorAll(".project-list > a")
const slider = document.querySelector(".project-slider")

function highlightProject(project,offset=0){
  const projectCoords = project.getBoundingClientRect();
        const coords = {
        width: projectCoords.width,
        height: projectCoords.height,
        top: projectCoords.top + window.scrollY,
        left: projectCoords.left + window.scrollX,
      }
  slider.style.height = `${coords.height}px`
  slider.style.transform = `translate(${coords.left}px, ${coords.top - 80 - 50 + offset}px)`
  slider.style.display = 'block'
}


function handleProjectClick(e) {
  e.preventDefault();
  highlightProject(this)
}

projects.forEach(p => p.addEventListener('click', handleProjectClick))
const firstProject = projects[0];
highlightProject(firstProject,5)
