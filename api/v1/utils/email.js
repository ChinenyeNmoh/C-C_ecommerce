const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.HOST,
			service: process.env.SERVICE,
			port: Number(process.env.EMAIL_PORT),
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

const emailVerificationTemplate = (link) => {
	return `<h3> Hello </h3>
	<p>
	Thank you for creating an account with C&C ecommerce.
	please click the link below to verify your account within 24 hours:
	</p>
	<br/>
	<a href="${link}">Click Here</a><br/>
	<br/>
	<p>If the button above isn’t working, paste the link below into your browser</p><br/>
	${link}
	<br/>
	<br/>
	<p>If you did not create an account with C&C ecommerce, just ignore this message.<br/>
	<br/>
	Thank you for choosing C&C ecommerce.
	</p>
	`
}

// password reset template
const passwordResetTemplate = (link, user) => {
	return `<p> Hi <strong>${user.local.firstname} ${user.local.lastname}</strong></p>,
	<br/>
	<p>
	There was recently a request to change the password on your account.
	If you requested this password change, please click the link below to set a new password within 24 hours:
	</p>
	<br/>
	<a href="${link}">Click Here</a><br/>
	<br/>
	<p>If the button above isn’t working, paste the link below into your browser</p><br/>
	${link}
	<br/>
	<br/>
	<p>If you don't want to change your password, just ignore this message.<br/>
	<br/>
	Thank you for choosing C&C ecommerce.
	</p>
	`
}

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
	  <td>${item.productId.name}</td>
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
		<td>${item.productId.name}</td>
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
	
module.exports = {emailVerificationTemplate, passwordResetTemplate, processOrderEmailTemplate, sendEmail, deliveredOrderEmailTemplate}