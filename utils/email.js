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
	<h4><strong>Order Id: </strong>${myOrder._id}</h4>
    <p><strong>Delivered At: </strong>${myOrder.createdAt.toString().substring(0, 10)}</p>
    <table>
        <thead>
        <tr>
        <td><span style="margin-right: 5px;"><strong>Product</strong></span></td>
        <td><span style="margin-right: 10px;"><strong>Quantity</strong></span></td>
        <td><span style="margin-left: 5px;"><strong align="right">Price</strong></span></td>
    </tr>
    
        </thead>
        <tbody>
            ${myOrder.products
                .map(
                    (item) => `
                        <tr>
                            <td>${item.productId.name}</td><span style="margin-left: 2px;">
                            <td align="center">${item.quantity}</td><span style="margin-left: 4px;">
                            <td align="right">N${item.price}</td></span></span>
                        </tr>
                    `
                )
                .join('\n')}
        </tbody>
        <tfoot>
		<br/>
            <tr>
                <td colspan="2"><strong> SubTotal:</strong></td>
                <td align="right">N${myOrder.subTotal}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>SubTotalAfterCoupon:</strong></td>
                <td align="right">N${myOrder.subTotalAfterCoupon}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Shipping Price:</strong></td>
                <td align="right">N${myOrder.shippingFee}</td>
            </tr>
			<br/>
            <tr>
                <td colspan="2"><strong>Total Price:</strong></td>
                <td align="right"><strong>N${myOrder.totalPrice}</strong></td>
            </tr>
			<br/>
            <tr>
                <td colspan="2"><strong>Payment Method:</strong></td>
                <td align="right">${myOrder.paymentMethod}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Payment Status:</strong></td>
                <td align="right">${myOrder.paymentStatus}</td>
            </tr>
            <tr>
    <td colspan="2"><strong>Payment Time:</strong></td>
    <td align="right">${myOrder.paidAt ? myOrder.paidAt.toString().substring(0, 25) : ''}</td>
    </tr>

            <tr>
                <td colspan="2"><strong>Order Status:</strong></td>
                <td align="right">${myOrder.orderStatus}</td>
            </tr>
        </tfoot>
    </table>

    <h2>Shipping address</h2>
    <p>
        <strong>Full Name: </strong>${myOrder.address.firstname} ${myOrder.address.lastname},<br/>
        <strong>Street: </strong>${myOrder.address.street},<br/>
        <strong>City: </strong>${myOrder.address.city},<br/>
        <strong>State: </strong>${myOrder.address.state},<br/>
        <strong>Landmark: </strong>${myOrder.address.landmark},<br/>
        <strong>Recipient Phone No: </strong>${myOrder.address.recipientPhoneNo}<br/>
    </p>

    <h2>Billing address</h2>
    <p>
        <strong>Full Name: </strong>${firstname} ${lastname},<br/>
        <strong>Phone Number: </strong>${phoneNo},<br/>
        <strong>Email: </strong>${email},<br/>
        <strong>Address: </strong>${myOrder.user.address},<br/>
    </p>
    <hr/>
    <p>
        Thank you for shopping with us.
    </p>
    `;
};      

const deliveredOrderEmailTemplate = (myOrder, firstname, lastname, email, phoneNo) => {
    return `
    <p>
        Hi ${firstname} ${lastname},
    </p>
    <p>Your order has been delivered.</p>
    <h4><strong>Order Id: </strong>${myOrder._id}</h4>
    <p><strong>Delivered At: </strong>${myOrder.createdAt.toString().substring(0, 10)}</p>
    <table>
        <thead>
        <tr>
        <td><span style="margin-right: 5px;"><strong>Product</strong></span></td>
        <td><span style="margin-right: 10px;"><strong>Quantity</strong></span></td>
        <td><span style="margin-left: 10px;"><strong align="right">Price</strong></span></td>
    </tr>
        </thead>
        <tbody>
            ${myOrder.products
                .map(
                    (item) => `
                        <tr>
                            <td>${item.productId.name}</td>
                            <td align="center">${item.quantity}</td>
                            <td align="right">N${item.price}</td>
                        </tr>
                    `
                )
                .join('\n')}
        </tbody>
        <tfoot>
		<br/>
            <tr>
                <td colspan="2"><strong> SubTotal:</strong></td>
                <td align="right">N${myOrder.subTotal}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>SubTotalAfterCoupon:</strong></td>
                <td align="right">N${myOrder.subTotalAfterCoupon}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Shipping Price:</strong></td>
                <td align="right">N${myOrder.shippingFee}</td>
            </tr>
			<br/>
            <tr>
                <td colspan="2"><strong>Total Price:</strong></td>
                <td align="right"><strong>N${myOrder.totalPrice}</strong></td>
            </tr>
			<br/>
            <tr>
                <td colspan="2"><strong>Payment Method:</strong></td>
                <td align="right">${myOrder.paymentMethod}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Payment Status:</strong></td>
                <td align="right">${myOrder.paymentStatus}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Payment Time:</strong></td>
                <td align="right">${myOrder.paidAt ? myOrder.paidAt.toString().substring(0, 25) : ''}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Delivered Time:</strong></td>
                <td align="right">${myOrder.deliveredAt ? myOrder.deliveredAt.toString().substring(0, 25) : ''}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Order Status:</strong></td>
                <td align="right">${myOrder.orderStatus}</td>
            </tr>
        </tfoot>
    </table>

    <h2>Shipping address</h2>
    <p>
        <strong>Full Name: </strong>${myOrder.address.firstname} ${myOrder.address.lastname},<br/>
        <strong>Street: </strong>${myOrder.address.street},<br/>
        <strong>City: </strong>${myOrder.address.city},<br/>
        <strong>State: </strong>${myOrder.address.state},<br/>
        <strong>Landmark: </strong>${myOrder.address.landmark},<br/>
        <strong>Recipient Phone No: </strong>${myOrder.address.recipientPhoneNo}<br/>
    </p>

    <h2>Billing address</h2>
    <p>
        <strong>Full Name: </strong>${firstname} ${lastname},<br/>
        <strong>Phone Number: </strong>${phoneNo},<br/>
        <strong>Email: </strong>${email},<br/>
        <strong>Address: </strong>${myOrder.user.address},<br/>
    </p>
    <hr/>
    <p>
        Thank you for shopping with us.
    </p>
    `;
};      

module.exports = {emailVerificationTemplate, passwordResetTemplate, processOrderEmailTemplate, sendEmail, deliveredOrderEmailTemplate}