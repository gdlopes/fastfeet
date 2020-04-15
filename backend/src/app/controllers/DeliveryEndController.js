import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliveryEndController {
  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivaryman = await Deliveryman.findByPk(req.body.deliveryman_id);

    if (!delivaryman) {
      return res
        .status(400)
        .json({ error: 'You should create this delivaryman first' });
    }

    let delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'You should create this delivery first' });
    }

    if (!delivery.start_date) {
      return res
        .status(400)
        .json({ error: 'You need to start this delivery before close it' });
    }

    if (delivery.end_date) {
      return res
        .status(400)
        .json({ error: 'This delivery has already been closed' });
    }

    const { deliveryman_id, signature_id } = req.body;

    /*
     * checks if this delivery belongs for this deliveryman
     */
    const checkDeliveryman = await Delivery.findOne({
      where: {
        id: req.params.id,
        deliveryman_id,
      },
    });

    if (!checkDeliveryman) {
      return res
        .status(400)
        .json({ error: 'This delivery belongs to another deliveryman' });
    }

    const signature = await File.findByPk(signature_id);

    if (!signature) {
      return res.status(400).json({ error: 'This image does not exists' });
    }

    await checkDeliveryman.update({
      signature_id,
      end_date: new Date(),
    });

    return res.json({ message: 'Delivery closed' });
  }
}

export default new DeliveryEndController();
