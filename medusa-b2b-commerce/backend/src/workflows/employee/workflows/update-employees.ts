import { when } from "@medusajs/framework/workflows-sdk";
import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { ModuleUpdateEmployee, QueryEmployee } from "../../../types";
import { removeAdminRoleStep, updateEmployeesStep } from "../steps";

export const updateEmployeesWorkflow = createWorkflow(
  "update-employees",
  (
    input: WorkflowData<ModuleUpdateEmployee>
  ): WorkflowResponse<QueryEmployee> => {
    const updatedEmployee = updateEmployeesStep(input);

    when(updatedEmployee, ({ is_admin }) => {
      return is_admin === false;
    }).then(() => {
      removeAdminRoleStep({
        email: updatedEmployee.customer.email,
      });
    });

    return new WorkflowResponse(updatedEmployee);
  }
);
