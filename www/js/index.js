const app = {
   savedProfiles: [],
   oneSavedProfile: {},
   urlProfiles: [],
   oneUrlProfile: {},
   KEY: "TUNDRAKEY",
   homeScreen: null,
   saveScreen: null,
   tiny: null,
   URL: "http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=female",
   imgBaseURL: null,

   init: () => {
      app.homeScreen = document.querySelector("#home-screen");
      app.saveScreen = document.querySelector("#save-screen");
      app.tiny = new tinyshell(app.homeScreen);

      window.sessionStorage.setItem(app.KEY, JSON.stringify(app.savedProfiles));
      app.addListeners();
      app.getUrlProfiles();
   },

   addListeners: () => {
      //Tap buttons
      document.getElementById("home-taps").addEventListener("click", app.nav);
      document.getElementById("saved-list-taps").addEventListener("click", app.nav);

      //swipe
      app.tiny.addEventListener("swipeleft", app.discardProfile);
      app.tiny.addEventListener("swiperight", app.saveProfile);
   },

   getUrlProfiles: () => {
      if (app.urlProfiles.length <= 3) {
         fetch(app.URL)
            .then(response => response.json())
            .then(data => {
               console.log("fetch- ", data);
               app.imgBaseURL = `https:${decodeURIComponent(data.imgBaseURL)}`;
               console.log("imgBaseURL- ", app.imgBaseURL);
               app.urlProfiles = [...app.urlProfiles, ...data.profiles];
               console.log("urlProfiles- ", app.urlProfiles);

               app.oneUrlProfile = app.urlProfiles.shift();
               app.homeDisplay();
            })
            .catch(err => {
               console.log('fetch err', err);
            });
      } else {
         app.oneUrlProfile = app.urlProfiles.shift();
         app.homeDisplay();
      }
   },

   homeDisplay: () => {
      const {
         first,
         avatar,
         last,
         gender,
         distance
      } = app.oneUrlProfile;
      document.querySelector('#img-profile').src = `${app.imgBaseURL}${avatar}`;
      document.querySelector('#name-profile').textContent = `${first} ${last}`;
      document.querySelector('#gender-profile').textContent = `${gender}`;
      document.querySelector('#distance-profile').textContent = `${distance}`;
   },

   discardProfile: (ev) => {
      console.log("response of swipeleft");
      app.getUrlProfiles();
   },

   saveProfile: () => {
      console.log("response of swiperight");
      app.setSavedProfiles();
      app.getUrlProfiles();
   },

   getSavedProfiles: () => {
      if (sessionStorage.getItem(app.KEY)) {
         let str = sessionStorage.getItem(app.KEY);
         app.savedProfiles = JSON.parse(str);
         console.log("app.savedProfiles- ", app.savedProfiles);
      }
   },

   setSavedProfiles: () => {
      app.getSavedProfiles();
      app.savedProfiles.push(app.oneUrlProfile);
      window.sessionStorage.setItem(app.KEY, JSON.stringify(app.savedProfiles));
   },

   savedListDisplay: () => {
      let profileList = document.querySelector("#saved-list")
      profileList.innerHTML = "";
      app.getSavedProfiles();

      app.savedProfiles.forEach(profile => {
         const {
            id,
            first,
            avatar,
            last
         } = profile;
         let div = document.createElement('div');
         div.setAttribute('data-id', id);
         div.setAttribute('class', 'wrapper-list-item');

         let img = document.createElement('img');
         img.setAttribute('data-id', id);
         img.setAttribute('class', 'list-img');
         img.src = `${app.imgBaseURL}${avatar}`;
         div.appendChild(img);

         let name = document.createElement('p');
         name.setAttribute('data-id', id);
         name.setAttribute('class', 'list-name');
         name.textContent = `${first} ${last}`;
         div.appendChild(name);

         let deleteButton = document.createElement('p');
         deleteButton.setAttribute('data-id', id);
         deleteButton.setAttribute('class', 'list-delete-button');
         deleteButton.textContent = "DELETE";
         deleteButton.addEventListener('click', app.deleteSavedProfile);
         div.appendChild(deleteButton);

         profileList.appendChild(div);
      });
   },


   deleteSavedProfile(ev) {
      let id = ev.target.getAttribute('data-id');
      let index = app.savedProfiles.findIndex(profile => {
         if (`${profile.id}` === `${id}`) return true;
      });
      if (index !== -1) {
         app.savedProfiles.splice(index, 1);
         console.log('app.savedProfiles after deleting: ', app.savedProfiles);
         window.sessionStorage.setItem(app.KEY, JSON.stringify(app.savedProfiles));
      };

      app.savedListDisplay();
   },


   nav: ev => {
      let btn = ev.target;

      let target = btn.getAttribute("data-target");
      let type = btn.getAttribute("data-type");
      if (type === "nav") {
         console.log("Navigate to", target);
         document.querySelector(".page.active").classList.remove("active");
         document.getElementById(target).classList.add("active");

         if (target === "home-screen") {
            app.homeDisplay();
         } else if (target === "saved-screen") {
            app.savedListDisplay();
         }
      }
   },


};

const ready = "cordova" in window ? "deviceready" : "DOMContentLoaded";
document.addEventListener(ready, app.init);