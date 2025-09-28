"use client";
import { useRouter } from "next/navigation";
import { CedarCaptionChat } from "../../../cedar/components/chatComponents/CedarCaptionChat";
import { TabView, TabPanel } from "primereact/tabview";
import "primereact/resources/themes/tailwind-light/theme.css";


export default function ChatPage() {
  const router = useRouter();
  return (
    <div>
    <button onClick={() => window.location.href = '/auth/logout'}>
      Logout
    </button>
      <TabView>
        <TabPanel header="Header I">
          <p className="m-0">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
          </p>
        </TabPanel>
        <TabPanel header="Header II">
          <p className="m-0">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...
          </p>
        </TabPanel>
        <TabPanel header="Header III">
          <p className="m-0">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium...
          </p>
        </TabPanel>
      </TabView>
    </div>
  );
}