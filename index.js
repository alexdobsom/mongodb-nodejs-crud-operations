// works with mongodb nodejs driver 3.4.1

// based on video tutorial: https://www.youtube.com/watch?v=ayNI9Q84v8g
// read tutorial: https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database
// more documentation: https://mongodb.github.io/node-mongodb-native/

// to be sure it works, in MongoDB Atlas, create a user and whitelist all IPs with 0.0.0.0/0


const { MongoClient } = require("mongodb");
// or var MongoClient = require('mongodb').MongoClient;

async function main() {
  const uri =
    "mongodb+srv://mmyself:mypass@cluster0-dk0wk.mongodb.net/test?retryWrites=true&w=majority";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    await client.connect();

    await listDatabases(client);

    // await createListing(client, {
    //   name: "APIs and Microservices",
    //   difficulty: "hard"
    // });

    // await createMultipleListings(client, [
    //   {
    //     name: "Course 1",
    //     difficulty: "easy"
    //   },
    //   {
    //     name: "Course 2",
    //     difficulty: "medium"
    //   },
    //   {
    //     name: "Course 3",
    //     difficulty: "hard"
    //   }
    // ]);

    // await findOneListingByName(client, "Course 1");

    // await findListingsWithMinimumBathroomsBedroomsAndMostRecentReviews(client, {
    //   minimumNumberOfBedrooms: 4,
    //   minimumNumberOfBathrooms: 2,
    //   maximumNumberOfResults: 5
    // });

    // await updateListingByName(client, "Infinite Views", { bedrooms: 6 });

    // await upsertListingByName(client, "Cozy Cottage", {
    //   name: "Cozy Cottage",
    //   bedrooms: 2,
    //   last_scraped: "2019-01-01"
    // });

    // await updateAllListingsToHavePropertyType(client);

    // await deleteListingByName(client, "Cozy Cottage");

    await deleteListingsScrapedBeforeDate(client, "2020-02-15"); //delete all listings last scraped before this date
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

//invoke the connection to the mongo cluster
main().catch(console.err);

//list the available databases:
async function listDatabases(client) {
  const databasesList = await client
    .db()
    .admin()
    .listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

//
// CREATE:
async function createListing(client, newListing) {
  const result = await client
    .db("FreeCodeCamp")
    .collection("Certifications")
    .insertOne(newListing);
  console.log("New listing created with the following id:", result.insertedId);
}

async function createMultipleListings(client, newListings) {
  const result = await client
    .db("FreeCodeCamp")
    .collection("Certifications")
    .insertMany(newListings);
  console.log(
    `${result.insertedCount} new listings(s) created with the following id(s):`
  );
  console.log(result.insertedIds);
}

//
// READ :
async function findOneListingByName(client, nameOfListing) {
  const result = await client
    .db("FreeCodeCamp")
    .collection("Certifications")
    .findOne({ name: nameOfListing });
  if (result) {
    console.log(
      `Fount a listing in the collection with the name '${nameOfListing}':`
    );
    console.log(result);
  } else {
    console.log(`No listings found with the name '${nameOfListing}'`);
  }
}

async function findListingsWithMinimumBathroomsBedroomsAndMostRecentReviews(
  client,
  {
    minimumNumberOfBathrooms = 0,
    minimumNumberOfBedrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
  } = {}
) {
  const cursor = client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({
      bedrooms: { $gte: minimumNumberOfBedrooms },
      bathrooms: { $gte: minimumNumberOfBathrooms }
    })
    // .sort( {last_review = -1} )
    .limit(maximumNumberOfResults);

  const results = await cursor.toArray();

  if (results.length > 0) {
    console.log(
      `Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms`
    );
    results.forEach((result, i) => {
      date = new Date(result.last_review).toDateString();
      console.log();
      console.log(`${i + 1}. name: ${result.name}`);
      console.log(`    _id: ${reusul._id} `);
      console.log(`    bedrooms: ${reusul.bedrooms} `);
      console.log(`    bathrooms: ${reusul._bathrooms} `);
      console.log(
        `    most recent review date: ${new Date(
          result.last_review
        ).toDateString()} `
      );
    });
  }
}

//
// UPDATE:
async function updateListingByName(client, nameOfListing, updatedListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviwes")
    .updateOne({ name: nameOfListing }, { $set: updatedListing });
  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document(s) was/were updated`);
}

//if there is no object then create one:
async function upsertListingByName(client, nameOfListing, updatedListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne(
      { name: nameOfListing },
      { $set: updatedListing },
      { upsert: true }
    );
  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  if (result.upseredCount > 0) {
    console.log(
      `One document was inserted with the id ${result.upsertedId._id}`
    );
  } else {
    console.log(`${result.modifiedCount} document(s) was/were updated`);
  }
}

// add new property to all those documents that don't have it
async function updateAllListingsToHavePropertyType(client) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateMany(
      { property_type: { $exists: false } },
      { $set: { property_type: "Unknown" } }
    );
  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document(s) was/were updated`);
}

//
// DELETE:
async function deleteListingByName(client, nameOfListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteOne({ name: nameOfListing });
  console.log(`${result.deletedCount} document(s) was/were deleted`);
}

async function deleteListingsScrapedBeforeDate(client, date) {
  const result = client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteMany({ last_scraped: { $lt: date } }); //$lt = less then
  console.log(`${result.deletedCount} document(s) was/were deleted`);
}
