import { useParams, useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";

export default function ContractChat() {
  const { contractId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="contract-chat-page">

      <div className="contract-chat-shell">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="contract-chat-header">

          <div className="contract-chat-heading">

            <div className="contract-chat-icon">
              💬
            </div>

            <div>
              <div className="contract-chat-eyebrow">
                CONTRACT COMMUNICATION
              </div>

              <h1>
                Contract Chat
              </h1>

              <p>
                Communicate directly about your
                agreement, delivery and order.
              </p>
            </div>

          </div>

          <div className="contract-chat-id">

            <span>
              CONTRACT
            </span>

            <strong>
              #{contractId?.slice(-10)?.toUpperCase()}
            </strong>

          </div>

        </div>


        {/* =================================================
            CHAT CARD
        ================================================= */}

        <div className="contract-chat-card">

          {/* CARD HEADER */}

          <div className="contract-chat-card-top">

            <div className="contract-chat-security">

              <span className="contract-chat-live-dot" />

              <div>
                <strong>
                  Secure contract conversation
                </strong>

                <small>
                  Messages are linked to this agreement
                </small>
              </div>

            </div>

            <button
              onClick={() =>
                navigate(
                  `/contracts/${contractId}`
                )
              }
            >
              View Contract
              <span>→</span>
            </button>

          </div>


          {/* CHAT */}

          <div className="contract-chat-body">

            <ChatBox
              contractId={contractId}
            />

          </div>

        </div>


        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="contract-chat-footer">

          <span>
            🔒
          </span>

          <p>
            Keep important agreement details,
            delivery updates and payment discussions
            inside this conversation.
          </p>

        </div>

      </div>

    </div>
  );
}