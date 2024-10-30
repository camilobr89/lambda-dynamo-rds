export interface IDisbursements {
    disbursement_id: string;
    request_id: string;
    identification_number: string;
    date: string;
    request_json: string;
    response_json: string;
    status: string;
    credit_number: string | null;
    product: string;
    amount: number;
    term: number;
    rate: number;
  }
  