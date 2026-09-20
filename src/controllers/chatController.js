import ChatMessage from "../models/chatMessage.js";
import Contract from "../models/contract.js";

import {
  success,
  failure
} from "../utils/response.js";

import {
  getIO
} from "../socket.js";


// ===============================
// Get Messages
// GET /api/v1/contracts/:id/messages
// ===============================

export const getMessages = async (
  req,
  res
) => {
  try {

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


    // Only participants can view chat

    const isFarmer =
      contract.farmer.toString() ===
      req.user._id.toString();

    const isBuyer =
      contract.buyer.toString() ===
      req.user._id.toString();


    if (!isFarmer && !isBuyer) {
      return failure(
        res,
        "Forbidden",
        403
      );
    }


    const messages =
      await ChatMessage.find({
        contract: contract._id
      })
        .populate(
          "sender",
          "name role"
        )
        .sort({
          createdAt: 1
        });


    return success(
      res,
      messages
    );

  } catch (err) {

    console.error(
      "GET MESSAGES ERROR:",
      err
    );

    return failure(
      res,
      "Failed to fetch messages",
      500
    );
  }
};


// ===============================
// Send Message
// POST /api/v1/contracts/:id/messages
// ===============================

export const sendMessage = async (
  req,
  res
) => {
  try {

    const message =
      req.body.message?.trim();


    if (!message) {
      return failure(
        res,
        "Message is required",
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


    // Only participants can send

    const isFarmer =
      contract.farmer.toString() ===
      req.user._id.toString();

    const isBuyer =
      contract.buyer.toString() ===
      req.user._id.toString();


    if (!isFarmer && !isBuyer) {
      return failure(
        res,
        "Forbidden",
        403
      );
    }


    const chatMsg =
      await ChatMessage.create({
        contract: contract._id,
        sender: req.user._id,
        message
      });


    const populatedMsg =
      await chatMsg.populate(
        "sender",
        "name role"
      );


    // Real-time message

    const io = getIO();

    io.to(
      contract._id.toString()
    ).emit(
      "newMessage",
      populatedMsg
    );


    return success(
      res,
      populatedMsg,
      201
    );

  } catch (err) {

    console.error(
      "SEND MESSAGE ERROR:",
      err
    );

    return failure(
      res,
      "Failed to send message",
      500
    );
  }
};