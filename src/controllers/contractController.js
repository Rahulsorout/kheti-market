import Contract from "../models/contract.js";
import { success, failure } from "../utils/response.js";

// Allowed status transitions
const ALLOWED_TRANSITIONS = {
  CREATED: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  DISPUTED: ["COMPLETED", "CANCELLED"],
  CANCELLED: []
};


// ===============================
// Get My Contracts
// GET /api/v1/contracts?role=farmer|buyer
// ===============================

export const getMyContracts = async (
  req,
  res
) => {
  try {

    const { role } = req.query;

    let filter = {};


    if (role === "farmer") {

      filter.farmer =
        req.user._id;

    } else if (role === "buyer") {

      filter.buyer =
        req.user._id;

    } else {

      filter = {
        $or: [
          {
            farmer:
              req.user._id
          },
          {
            buyer:
              req.user._id
          }
        ]
      };

    }


    const contracts =
      await Contract.find(filter)
        .populate(
          "farmer",
          "name email phone profile"
        )
        .populate(
          "buyer",
          "name email phone profile"
        )
        .populate(
          "listing",
          "cropName quantity unit minPrice location expectedHarvestDate status"
        )
        .populate(
          "bid",
          "price quantity deliveryDate status"
        )
        .populate(
  "order",
  "quantity totalPrice status"
)
        .sort({
          createdAt: -1
        });


    return success(
      res,
      contracts
    );

  } catch (err) {

    console.error(
      "GET MY CONTRACTS ERROR:",
      err
    );

    return failure(
      res,
      "Failed to fetch contracts",
      500
    );
  }
};


// ===============================
// Get Contract Detail
// GET /api/v1/contracts/:id
// ===============================

export const getContractDetail =
  async (req, res) => {

    try {

      const contract =
        await Contract.findById(
          req.params.id
        )
          .populate(
            "farmer",
            "name email phone profile"
          )
          .populate(
            "buyer",
            "name email phone profile"
          )
          .populate(
            "listing",
            "cropName quantity unit minPrice location expectedHarvestDate status"
          )
          .populate(
            "bid",
            "price quantity deliveryDate status"
          )
          .populate(
  "order",
  "quantity totalPrice status"
);


      if (!contract) {

        return failure(
          res,
          "Contract not found",
          404
        );

      }


      // Only participants can view

      const isFarmer =
        contract.farmer._id.toString() ===
        req.user._id.toString();

      const isBuyer =
        contract.buyer._id.toString() ===
        req.user._id.toString();


      if (
        !isFarmer &&
        !isBuyer
      ) {

        return failure(
          res,
          "Forbidden",
          403
        );

      }


      return success(
        res,
        contract
      );

    } catch (err) {

      console.error(
        "GET CONTRACT DETAIL ERROR:",
        err
      );

      return failure(
        res,
        "Invalid contract id",
        400
      );
    }
  };


// ===============================
// Update Contract Status
// POST /api/v1/contracts/:id/status
// ===============================

export const updateContractStatus =
  async (req, res) => {

    try {

      const {
        status: newStatus
      } = req.body;


      if (!newStatus) {

        return failure(
          res,
          "Status is required",
          400
        );

      }


      const contract =
        await Contract.findById(
          req.params.id
        );


      if (!contract) {

        return failure(
          res,
          "Contract not found",
          404
        );

      }


      // Only participants can update

      const isFarmer =
        contract.farmer.toString() ===
        req.user._id.toString();

      const isBuyer =
        contract.buyer.toString() ===
        req.user._id.toString();


      if (
        !isFarmer &&
        !isBuyer
      ) {

        return failure(
          res,
          "Forbidden",
          403
        );

      }


      const currentStatus =
        contract.status;


      const allowedNext =
        ALLOWED_TRANSITIONS[
          currentStatus
        ] || [];


      if (
        !allowedNext.includes(
          newStatus
        )
      ) {

        return failure(
          res,
          `Invalid status transition from ${currentStatus} to ${newStatus}`,
          400
        );

      }


      contract.status =
        newStatus;


      await contract.save();


      return success(
        res,
        contract
      );

    } catch (err) {

      console.error(
        "UPDATE CONTRACT STATUS ERROR:",
        err
      );

      return failure(
        res,
        "Failed to update contract status",
        500
      );
    }
  };