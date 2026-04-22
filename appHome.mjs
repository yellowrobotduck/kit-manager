import {SlackProfileManager} from "./SlackProfileManager.mjs"

// Called when user opens the app - return a view of available profiles
export const createHome = async(profileConfig, userEmail) => {
    if(!profileConfig.profiles){
        return;
    }
    // Note: iterate profiles might be better solution here as it can flag the groups with the same name.
    // Note: though the method used below is using less API calls
    const profileManager = new SlackProfileManager()
    const userWithGroups = await profileManager.lookupUserGroupByEmail(userEmail);
    const view = {
        "type": "home",
        "blocks": [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "Hey Robot!* \n\nYou will use this Twingate Slackbot to turn on or remove _Full Tunnel Access_.\n _Full Tunnel Access_ allows you to:\n1. Activate your Dev or Test Kit\n2. Play on your Dev or Test Kit\n3. Play with PSN\n\n_If you're having issues activating or connecting to your kit, it never hurts to try resharing your Twingate VPN._"
                }
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: "<https://github.com/Twingate-Labs/tg-group-profile-manager|GitHub> and <https://github.com/Twingate-Labs/tg-group-profile-manager/blob/main/README.md|User Guide>"
                    }
                ]
            }
        ]
    }
    if (!userWithGroups) {
        console.log(`Email '${userEmail}' not found in Twingate`)
        view.blocks.push({
                type: "divider"
            },
            {
                type: "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*ERROR*\n Email '${userEmail}' not found in Twingate, please ensure your Slack account email address is the same as your Twingate email address.`
                }
            })
         return view
    }

    const permittedProfiles = profileConfig.profiles.filter(profile => userWithGroups.groups.map(group=>group.name).includes(profile.applicableToGroup))

    for (const permittedProfile of permittedProfiles){
        const block = await permittedProfile.getAppHomeBlock(userWithGroups);
        if ( block != null ) view.blocks.push({type: "divider"}, block);
    }
    return view
};