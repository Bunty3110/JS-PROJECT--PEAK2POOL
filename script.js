'use strict';


/////////////////////////////////////////////////
class Workout {
  date = new Date();
   id = (Date.now() + '').slice(-10);
  

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  setDescription()
  { // prettier-ignore
    const months = [
     'January',
     'February',
     'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
   ];
   this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;


  }

 
}
class Swimming extends Workout {
  type = 'swimming';
  constructor(coords, distance, duration, depth) {
    super(coords, distance, duration);
    this.depth = depth;
    this.calcspeed();
    this.setDescription();
  }
  calcspeed() {
    this.speed = this.distance / (this.duration/60);
    return this.speed;
  }
}

class Trekking extends Workout {
  type = 'trekking';
  constructor(coords, distance, duration, height) {
    super(coords, distance, duration);
    
    this.height = height;
    this.calcspeed();
    this.setDescription();
  }
  calcspeed() {
    this.speed = this.distance / (this.duration/60);
    return this.speed;
  }
}

/////////////////////////////////////////////////
//


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputdepth = document.querySelector('.form__input--depth');
const inputheight = document.querySelector('.form__input--height');
//////////////////////////////////////////////////
class App {
  #map;
  #mapEvent;
  #workouts=[];
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleheight.bind(this));
    containerWorkouts.addEventListener('click',this._movePopup.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        },
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords).addTo(this.#map).bindPopup('You').openPopup();

    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
     inputDistance.value =
      inputDuration.value =
      inputdepth.value =
      inputheight.value =
        '';
    form.classList.add('hidden');
  }
  _toggleheight() {
    inputheight.closest('.form__row').classList.toggle('form__row--hidden');
    inputdepth.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    const validInputs = (...inputs)=> inputs.every(inp=> Number.isFinite(inp))
    const allPositive = (...inputs)=> inputs.every(inp=> inp>0)
    e.preventDefault();
    // get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const depth=+inputdepth.value;
    const height=+inputheight.value;
    let workout;

    // if running then runnig workout
    if (type === 'swimming') {
      // if data is valid check
      if(!validInputs(distance,duration,depth)||!allPositive(distance,duration,depth)) return alert('Inputs have to be positive number!')
        workout = new Swimming([lat,lng], distance , duration, depth)
    }

    // if cycling then cycling workout
    if (type === 'trekking') {
      // if data is valid check
      if(!validInputs(distance,duration,height)||!allPositive(distance,duration)) return alert('Inputs have to be positive number!')
        workout = new Trekking([lat,lng], distance , duration, height)
    }

    // add to workout list
     this.#workouts.push(workout);
    
    // render workout as marker on map
     this._renderWorkoutMarker(workout)

  
    

    // render workout in list
     this._renderWorkout(workout)

    // close form and clerar input
     this._hideForm()
      this._setLocalStorage();

        
        
      }
      _renderWorkout(workout)
      {
        let html= 
        `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${      workout.type ==='running'? '🏊':'🧗'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
         </div>
        `
        if (workout.type === 'swimming')
      html += `
        <div class="workout__details">
          <span class="workout__icon">🏊</span>
          <span class="workout__value">${workout.depth}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
       if (workout.type === 'trekking')
      html += `
        
         <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.height}</span>
          <span class="workout__unit">m</span>
         </div>
         </li>
        `;

       form.insertAdjacentHTML('afterend',html);

      }
      _renderWorkoutMarker(workout)
      {
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            className: `${workout.type}-popup`,
          }),
        )
        .setPopupContent(`${workout.description}`)
        .openPopup();
      }
      _movePopup(e){
        if(!this.#map) return;
        const workoutel=e.target.closest('.workout');
        if(!workoutel) return;

        const workout = this.#workouts.find( work => work.id === workoutel.dataset.id);
        this.#map.setView(workout.coords,13,{
          animate: true,
          pan:{
            duration:1,
          },
        })

      }
     _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
