import { Request, Response } from "express";
import  AdminService from "../services/adminService";

export class AdminController {

  static async dashboard(req: Request, res: Response) {
    const data = await AdminService.getDashboardStats();
    res.json(data);
  }

  static async users(
  req: Request,
  res: Response
) {

  const users =
    await AdminService.getUsers();

  res.json({
    users,
  });
}

static async approveSeller(
  req: any,
  res: Response
) {

  const result =
    await AdminService.approveSeller(
      req.params.id,
      req.user.id
    );

  res.json(result);
}

static async rejectSeller(
  req: any,
  res: Response
) {

  const result =
    await AdminService.rejectSeller(
      req.params.id,
      req.user.id
    );

  res.json(result);
}

static async unsuspendUser(
  req: any,
  res: Response
) {

  const result =
    await AdminService.unsuspendUser(
      req.params.id,
      req.user.id
    );

  res.json(result);
}

  static async listings(
  req: Request,
  res: Response
) {

  const listings =
    await AdminService.getListings();

  res.json({
    listings,
  });
}

  static async approveListing(req: any, res: Response) {
    const result = await AdminService.approveListing(
      req.params.id,
      req.user.id
    );

    res.json(result);
  }

  static async rejectListing(req: any, res: Response) {
    const result = await AdminService.rejectListing(
      req.params.id,
      req.user.id
    );

    res.json(result);
  }

  static async flagListing(req: any, res: Response) {
  const result = await AdminService.flagListing(
    req.params.id,
    req.user.id
  );

  res.json(result);
}
static async revertListing(
  req: any,
  res: Response
) {

  const result =
    await AdminService.revertListing(
      req.params.id,
      req.user.id
    );

  res.json(result);
}

  static async suspendUser(req: any, res: Response) {
    const result = await AdminService.suspendUser(
      req.params.id,
      req.user.id
    );

    res.json(result);
  }

  static async logs(req: Request, res: Response) {
    const logs = await AdminService.getLogs();
    res.json(logs);
  }
}