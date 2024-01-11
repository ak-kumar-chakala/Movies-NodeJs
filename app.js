const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const intiliazeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(e.message);
  }
};
intiliazeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT *
    FROM movie
    ORDER BY movie_id;
    `;
  let moviesArray = await db.all(getMovies);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const moveDetails = request.body;
  const { directorId, movieName, leadActor } = moveDetails;

  const insertMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');
    `;

  const Dbresponse = await db.run(insertMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id=${movieId};
    `;

  const movie = await db.get(movieQuery);
  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateQuery = `
    UPDATE movie
    SET 
    director_id='${directorId}',
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId};
    `;
  const DbResponse = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  let directorsQuery = `SELECT * FROM director
    ORDER BY director_id;
    `;
  let DbResult = await db.all(directorsQuery);
  response.send(
    DbResult.map((eachDirec) => ({
      directorId: eachDirec.director_id,
      directorName: eachDirec.director_name,
    }))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  let directorMoviesQuery = `
    SELECT m.movie_name
    FROM movie AS m INNER JOIN director AS d ON m.director_id=d.director_id
    WHERE d.director_id=${directorId};`;
  const dbResult = await db.all(directorMoviesQuery);

  response.send(
    dbResult.map((eachMovie) => {
      return { movieName: eachMovie.movie_name };
    })
  );
});

module.exports = app;
