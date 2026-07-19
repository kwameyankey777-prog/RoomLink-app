import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { type, to, hostelName, roomType, message, studentName } = await request.json();

  try {
    let subject, html;

    if (type === "new_request") {
      subject = `New booking request for ${hostelName}`;
      html = `
        <p>You have a new booking request on HnAlink.</p>
        <p><strong>Hostel:</strong> ${hostelName}</p>
        <p><strong>Room type:</strong> ${roomType}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
        <p>Log in to your dashboard to accept or decline this request.</p>
      `;
    } else if (type === "accepted") {
      subject = `Your booking request for ${hostelName} was accepted!`;
      html = `
        <p>Good news, ${studentName || "there"}!</p>
        <p>Your booking request for <strong>${hostelName}</strong> has been accepted.</p>
        <p>Please contact the owner to complete payment and finalize your reservation.</p>
      `;
    } else if (type === "declined") {
      subject = `Update on your booking request for ${hostelName}`;
      html = `
        <p>Hi ${studentName || "there"},</p>
        <p>Unfortunately, your booking request for <strong>${hostelName}</strong> was declined by the owner.</p>
        <p>Feel free to browse other listings on HnAlink.</p>
      `;
    } else {
      return Response.json({ error: "Invalid email type" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "HnAlink <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}