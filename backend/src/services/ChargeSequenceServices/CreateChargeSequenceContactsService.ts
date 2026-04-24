import ChargeSequenceContact from "../../models/ChargeSequenceContact";

interface ChargeSequenceContactData {
  chargeSequenceId: number | string;
  contactId: number | string;
  chargeId?: number | string;
}

interface Request {
  chargeSequenceContacts: ChargeSequenceContactData[];
  chargeSequenceId: number | string;
}

const CreateChargeSequenceContactsService = async ({
  chargeSequenceContacts,
  chargeSequenceId
}: Request): Promise<void> => {
  const existingContacts = await ChargeSequenceContact.findAll({
    where: {
      chargeSequenceId
    }
  });

  const data: ChargeSequenceContactData[] = chargeSequenceContacts.map(
    (contact: any) => {
      return {
        contactId: contact.id || contact.contactId,
        chargeSequenceId,
        chargeId: contact.chargeId || null,
        sendCount: 0,
        stopCharging: false
      };
    }
  );

  const filterData = data.filter((d: any): any => {
    const isExists = existingContacts?.findIndex(
      (c: any) =>
        d.contactId === c.contactId &&
        +chargeSequenceId === c.chargeSequenceId
    );
    if (isExists === -1) {
      return d;
    }
  });

  if (filterData.length > 0) {
    await ChargeSequenceContact.bulkCreate(filterData);
  }
};

export default CreateChargeSequenceContactsService;
