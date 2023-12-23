import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	Setting,
} from "obsidian";
import * as path from "path";
import * as fs from "fs";

type Result = {
	name: string;
};

export default class MyPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "duplicate-current-note",
			name: "Duplicate current note",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const onDuplicate = (result: Result) => {
					const file = this.app.workspace.getActiveFile();
					if (file && result.name) {
						const dir = path.dirname(file.path);
						const filePath = path.join(dir, `${result.name}.md`);
						const fmp =
							this.app.metadataCache.getFileCache(
								file
							)?.frontmatterPosition;
						const text = editor.getDoc().getValue();
						let content = "";
						if (fmp) {
							const end = fmp.end.line + 1;
							content = text.split("\n").slice(0, end).join("\n");
						}
						this.app.vault.create(filePath, content);
						new Notice(`Create note as ${filePath}`);
					}
				};
				new AskFileInfoModal(this.app, onDuplicate).open();
			},
		});
	}

	onunload() {}
}

export class AskFileInfoModal extends Modal {
	result: Result = {
		name: "",
	};

	onSubmit: (result: Result) => void;

	constructor(app: App, onSubmit: (result: Result) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Enter New File Info!");

		new Setting(contentEl).setName("File Name").addText((text) =>
			text.onChange((value) => {
				this.result.name = value;
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.result);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
