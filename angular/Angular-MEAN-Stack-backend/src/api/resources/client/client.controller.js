import HttpStatus from "http-status-codes";
import Client from "./client.model";
import clientService from "./client.service";

export default {
  async create(req, res) {
    try {
      const { value, error } = clientService.validateCreateSchema(req.body);
      if (error && error.details) {
        return res.status(HttpStatus.BAD_REQUEST).json(error);
      }
      const client = await Client.create(value);
      return res.json(client);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },
  async findAll(req, res) {
    try {
      const clients = await Client.find();
      return res.json(clients);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },
  async findOne(req, res) {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ err: "client not found" });
      }
      return res.json(client);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },
  async delete(req, res) {
    try {
      const client = await Client.findByIdAndDelete({ _id: req.params.id });
      if (!client) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ err: "could not delete client" });
      }
      return res.json(client);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },
  async update(req, res){
    try{
      const { value, error } = clientService.validateUpdateSchema(req.body);
      if (error && error.details) {
        return res.status(HttpStatus.BAD_REQUEST).json(error);
      }
      const client = await Client.findByIdAndUpdate({_id: req.params.id}, value, {new: true})
      return res.json(client);
    }
    catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }
};
