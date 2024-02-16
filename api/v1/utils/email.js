const nodemailer = require("nodemailer");
const sendEmail = async (email, subject, html) => {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.HOST,
			service: process.env.SERVICE,
			port: Number(process.env.EMAIL_PORT),
			secure: Boolean(process.env.SECURE),
			auth: {
				user: process.env.USER,
				pass: process.env.PASS,
			},
		});

		await transporter.sendMail({
			from: process.env.USER,
			to: email,
			subject: subject,
			html: html
		});
		console.log("email sent successfully");
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
};

const processOrderEmailTemplate = (myOrder, firstname, lastname, email, phoneNo) => {
	return `<h1>Thanks for shopping with us</h1>
	<p>
	Hi ${firstname}  ${lastname},</p>
	<p>We have received  your order and its being processed .</p>
	<h2>[Order ${myOrder._id}] (${myOrder.createdAt.toString().substring(0, 10)})</h2>
	<table>
	<thead>
	<tr>
	<td><strong>Product</strong></td>
	<td><strong>Quantity</strong></td>
	<td><strong align="right">Price</strong></td>
	</thead>
	<tbody>
	${myOrder.products
	  .map(
	  (item) => `
	  <tr>
	  <td>${item.productId.title}</td>
	  <td align="center">${item.quantity}</td>
	  <td align="right"> $${item.price}</td>
	  </tr>
	`
	  )
	  .join('\n')}
	</tbody>
	<tfoot>
	<tr>
	<td colspan="2">SubTotal:</td>
	<td align="right"> $${myOrder.subTotal}</td>
	</tr>
	<tr>
	<td colspan="2">SubTotalAfterCoupon:</td>
	<td align="right"> $${myOrder.subTotalAfterCoupon}</td>
	</tr>
	<tr>
	<td colspan="2">Shipping Price:</td>
	<td align="right"> $${myOrder.shippingFee}</td>
	</tr>
	<tr>
	<td colspan="2"><strong>Total Price:</strong></td>
	<td align="right"><strong> $${myOrder.totalPrice}</strong></td>
	</tr>
	<tr>
	<td colspan="2">Payment Method:</td>
	<td align="right">${myOrder.paymentMethod}</td>
	</tr>
	<tr>
	  <td colspan="2">Payment Status:</td>
	  <td align="right">${myOrder.paymentStatus}</td>
	</tr>
	<tr>
	<td colspan="2">Order Status:</td>
	<td align="right">${myOrder.orderStatus}</td>
	</tr>
	</table>
	
	<h2>Shipping address</h2>
	<p>
	${myOrder.address.firstname}   ${myOrder.address.lastname},<br/>
	${myOrder.address.street},<br/>
	${myOrder.address.city},<br/>
	${myOrder.address.state},<br/>
	${myOrder.address.landmark},<br/>
	${myOrder.address.recipientPhoneNo}<br/>
	</p>
	<h2>Billing address</h2>
	<p>
	${firstname} ${lastname},<br/>
	${phoneNo},<br/>
	${email},<br/>
	${myOrder.user.address},<br/>
	</p>
	<hr/>
	<p>
	Thanks for shopping with us.
	</p>
	`;
};

const deliveredOrderEmailTemplate = (myOrder, firstname, lastname, email, phoneNo) => {
	return `<h1>Thanks for shopping with us</h1>
	<p>
	Hi ${firstname}  ${lastname},</p>
	<p>Your order has been delivered.</p>
	<h2>[Order ${myOrder._id}] (${myOrder.createdAt.toString().substring(0, 10)})</h2>
	<table>
	<thead>
	<tr>
	<td><strong>Product</strong></td>
	<td><strong>Quantity</strong></td>
	<td><strong align="right">Price</strong></td>
	</thead>
	<tbody>
	${myOrder.products
		.map(
		(item) => `
		<tr>
		<td>${item.productId.title}</td>
		<td align="center">${item.quantity}</td>
		<td align="right"> $${item.price}</td>
		</tr>
	`
		)
		.join('\n')}
	</tbody>
	<tfoot>
	<tr>
	<td colspan="2">SubTotal:</td>
	<td align="right"> $${myOrder.subTotal}</td>
	</tr>
	<tr>
	<td colspan="2">SubTotalAfterCoupon:</td>
	<td align="right"> $${myOrder.subTotalAfterCoupon}</td>
	</tr>
	<tr>
	<td colspan="2">Shipping Price:</td>
	<td align="right"> $${myOrder.shippingFee}</td>
	</tr>
	<tr>
	<td colspan="2"><strong>Total Price:</strong></td>
	<td align="right"><strong> $${myOrder.totalPrice}</strong></td>
	</tr>
	<tr>
	<td colspan="2">Payment Method:</td>
	<td align="right">${myOrder.paymentMethod}</td>
	</tr>
	<tr>
	<td colspan="2">Payment Status:</td>
	<td align="right">${myOrder.paymentStatus}</td>
	</tr>
	<tr>
	<td colspan="2">Payment Time:</td>
	<td align="right">${myOrder.paidAt}</td>
	</tr>
	<tr>
	<td colspan="2">Order Status:</td>
	<td align="right">${myOrder.orderStatus}</td>
	</tr>
	</table>
	
	<h2>Shipping address</h2>
	<p>
	${myOrder.address.firstname}   ${myOrder.address.lastname},<br/>
	${myOrder.address.street},<br/>
	${myOrder.address.city},<br/>
	${myOrder.address.state},<br/>
	${myOrder.address.landmark},<br/>
	${myOrder.address.recipientPhoneNo}<br/>
	</p>
	
	<h2>Billing address</h2>
	<p>
	${firstname} ${lastname},<br/>
	${phoneNo},<br/>
	${email},<br/>
	${myOrder.user.address},<br/>
	</p>
	<hr/>
	<p>
	Thank you for shopping with us.
	</p>
`;
};        
	
module.exports = {processOrderEmailTemplate, sendEmail, deliveredOrderEmailTemplate}