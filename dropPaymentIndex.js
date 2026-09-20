import mongoose from "mongoose";
import "dotenv/config";

async function removeOldIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const collection = mongoose.connection.db.collection("payments");

    const indexes = await collection.indexes();

    console.log("Current indexes:");
    console.log(indexes);

    const contractIndex = indexes.find(
      (index) => index.name === "contract_1"
    );

    if (!contractIndex) {
      console.log("contract_1 index does not exist.");
    } else {
      await collection.dropIndex("contract_1");

      console.log(
        "contract_1 index deleted successfully."
      );
    }

    const remainingIndexes =
      await collection.indexes();

    console.log("Remaining indexes:");
    console.log(remainingIndexes);

  } catch (error) {
    console.error(
      "INDEX REMOVAL ERROR:",
      error
    );
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

removeOldIndex();