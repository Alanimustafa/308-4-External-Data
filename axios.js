import * as Carousel from "./Carousel.js";

// Set up Axios defaults
axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] =
  "live_eQAr1APzv1d63mF9yOKgVfkRoPkn0e1IIxQenquDO0xdsHKIbfffTDYMcM5ngL2q";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");

// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_eQAr1APzv1d63mF9yOKgVfkRoPkn0e1IIxQenquDO0xdsHKIbfffTDYMcM5ngL2q";
// CAT API key has been added above.

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

let allBreedArray = []; // The array contains breeds objects

async function initialLoad() {
  try {
    const breedAxios = await axios.get("/breeds");
    allBreedArray = breedAxios.data; // All breeds object have been collected in allBreedArray.

    for (let i = 0; i < allBreedArray.length; i++) {
      let breedOption = document.createElement("option");
      breedOption.text = allBreedArray[i].name;
      breedOption.value = allBreedArray[i].id; // Set value attribute to the breed ID
      breedSelect.appendChild(breedOption);
    }
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

breedSelect.addEventListener("change", retreiveTheBreed);

let breedDetail = []; // The array for each breed property.

async function retreiveTheBreed() {
  Carousel.clear(); // Clears the existing images and info
  try {
    interceptorReq();
    const selectedBreed = breedSelect.value;
    console.log("Selected breed value:", selectedBreed);

    const dataBreed = await axios.get(`/breeds/${selectedBreed}`);

    breedDetail = dataBreed.data;
    
    infoDump.textContent = breedDetail.description;
    const innerCarousel = document.createElement("h1");
    innerCarousel.textContent = breedDetail.name;
    infoDumpHeader.appendChild(innerCarousel);

    // fetch the images of the selected breed
    let previousImgID = ""; // This is to check if consecutive images are the same, if so break out of loop

    for (let i = 0; i < 10; i++) {
      const dataImage = await axios.get(`/images/search`, {
        params: { breed_ids: selectedBreed },
      });


      const url = dataImage.data[0].url;
      const imageID = dataImage.data[0].id;

      if (imageID === previousImgID) break; // If two images are the same then end loop
      previousImgID = imageID;
      const imgAlt = "Image of " + dataImage.data[0].breeds[0].name;

      const imageItem = Carousel.createCarouselItem(url, imgAlt, imageID);
      Carousel.appendCarousel(imageItem);
    }

    Carousel.start();
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

async function interceptorReq() {
  axios.interceptors.request.use((request) => {
    request.metadata = request.metadata || {};
    request.metadata.startTime = new Date().getTime();
    document.body.style.cursor = "progress";
    progressBar.style.width = "0px";
    return request;
  });

  axios.interceptors.response.use(
    (response) => {
      response.config.metadata.endTime = new Date().getTime();
      response.config.metadata.durationInMS =
        response.config.metadata.endTime - response.config.metadata.startTime;

      console.log(
        `Request took ${response.config.metadata.durationInMS} milliseconds.`
      );
      document.body.style.cursor = "default";
      progressBar.style.width = "100%";
      return response;
    },
    (error) => {
      error.config.metadata.endTime = new Date().getTime();
      error.config.metadata.durationInMS =
        error.config.metadata.endTime - error.config.metadata.startTime;

      console.log(
        `Request took ${error.config.metadata.durationInMS} milliseconds.`
      );
      throw error;
    }
  );
}

function updateProgress(event) {
  if (event.lengthComputable) {
    const percentCompleted = (event.loaded / event.total) * 100;
    progressBar.style.width = `${percentCompleted}%`;
  }
}

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 */

// export async function favourite(imgId) {
//   alert("the image id: ", imgId);
//   const response = await axios.get("/favourites", {
//     params: { limit: 20, sub_id: "user-123", order: "DESC" },
//   });
//   const favourites = response.data;
//   console.log(favourites);
// }

export async function favourite(imgId) {
  try {
    const response = await axios.get("/favourites", {
      params: {},
    });
    const favourites = response.data;

    const existingFavourite = favourites.find((fav) => fav.image.id === imgId);

    if (existingFavourite) {
      await axios.delete(`/favourites/${existingFavourite.id}`, {
        headers: { "x-api-key": API_KEY },
      });
      alert("Image removed from favourites");
    } else {
      await axios.post(
        "/favourites",
        { image_id: imgId, sub_id: "user-123" },
        { headers: { "x-api-key": API_KEY } }
      );
      alert("Image added to favourites");
    }
  } catch (error) {
    console.error("Error in favourite function:", error);
  }
}

getFavouritesBtn.addEventListener("click", async () => {
  Carousel.clear();
  const response = await axios.get("/favourites", {
    params: { sub_id: "user-123" },
  });

  response.data.forEach((favourite) => {
    const imageItem = Carousel.createCarouselItem(
      favourite.image.url,
      "Favourite cat image",
      favourite.id
    );
    Carousel.appendCarousel(imageItem);
  });
  Carousel.start();
});
