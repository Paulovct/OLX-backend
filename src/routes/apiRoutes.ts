import {Router } from "express";
import * as apiController from "../controllers/apiController";
import * as AuthController from "../controllers/AuthController";
import * as UserController from "../controllers/UserController";
import * as AdsController from "../controllers/AdsController";

import Auth from "../middlewares/Authentication";

import Validator from "../validators/AuthValidator";

import UserValidator from "../validators/UserValidator";


const router = Router();

router.get("/ping" , apiController.ping);

router.get("/states", UserController.getStates);

router.post("/user/signin", Validator.signin ,AuthController.signin);
router.post("/user/signup", Validator.signup, AuthController.signup);

router.get("/user/me" ,Auth.private, UserController.info);
router.put("/user/me" , Auth.private , UserValidator.editAction , UserController.editAction);

router.get("/categories", AdsController.getCategories);

router.post("/ad/add" ,Auth.private , AdsController.addAction);
router.get("/ad/list" , AdsController.getList );
router.get("/ad/:id" , AdsController.getItem);
router.post("/ad/:id" , Auth.private , AdsController.editAction);

export default router;